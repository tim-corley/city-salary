const limit = 200; // 500
const lowZip = '01001'; // 01001
const highZip = '02791'; // 02791
const wantedProps = ['POSTAL', 'TITLE', 'DEPARTMENT_NAME', 'TOTAL EARNINGS'];

// CREATE ARRAY OF ALL URLS TO BE CALLED
const urls = [];
const zipCodes = createPaddedZipArr(lowZip, highZip);
for (let i = 0; i < zipCodes.length; i++) {
  const zipUrl = `https://data.boston.gov/api/3/action/datastore_search_sql?sql=SELECT * from "31358fd1-849a-48e0-8285-e813f6efbdf1" WHERE _full_text @@ to_tsquery('${zipCodes[i]}') LIMIT ${limit}`;
  urls.push(zipUrl);
}

// https://teamtreehouse.com/library/manage-multiple-requests-with-promiseall
Promise.all(urls.map((url) =>
  fetch(url)
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .catch((err) => {
        console.error(err);
      })
))
    // IF RESPONSE HAS DATA, PUSH TO ARRAY
    .then((data) => {
      const rawDataArr = [];
      data.forEach((d) => {
        if (d.result.records.length > 0) {
          rawDataArr.push(d.result.records);
        }
      });
      return rawDataArr;
    })
    // PUSH FILTERED (DESIRED PROPS ONLY) OBJECTS TO NEW ARRAY
    .then((rawDataArr) => {
      const filteredRecords = [];
      rawDataArr.forEach((result) => {
        result.forEach((item) => {
          filteredRecords.push(propsPicker(item, wantedProps));
        });
      });
      // console.log(filteredRecords);
      return filteredRecords; // array of all filtered objects
    })
    // GET ALL DEPTS NAMES -> REMOVE DUPLICATES -> CREATE NEW OBJ FOR EACH DEPT
    .then((filteredRecords) => {
      const allDepts = [];
      const records = filteredRecords;
      for (let i = 0; i < records.length; i++) {
        allDepts.push(records[i].DEPARTMENT_NAME);
      }
      // get filtered array of dept names (i.e. unique)
      const filteredDepts = allDepts.filter((dept, index) => allDepts.indexOf(dept) === index);
      // for each item in arr, create new object (object of objects)
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries
      // https://stackoverflow.com/questions/42974735/create-object-from-array
      const obj = Object.fromEntries(
          filteredDepts.map((dept) => [dept, {
            name: dept,
            sumEarnings: 0,
            count: 0,
            avrSal: 0,
          }])
      );
      // CREATE ARRAY OF ALL DEPT OBJECTS
      // https://medium.com/chrisburgin/javascript-converting-an-object-to-an-array-94b030a1604c
      const deptArr = Object.keys(obj).map((i) => obj[i]);
      // WHEN ARR DEPT NAME MATCHES OBJ DEPT NAME -> INCREMENT COUNT & EARNINGS (IN OBJ)
      filteredRecords.forEach((record) => {
        deptArr.forEach((obj) => {
          if (obj.name.includes(record.DEPARTMENT_NAME)) {
            obj.count += 1;
            const earnings = record['TOTAL EARNINGS'];
            const earningsNum = parseFloat(earnings.replace(',', ''));
            obj.sumEarnings += earningsNum;
            obj.avrSal = (obj.sumEarnings / obj.count);
          }
        });
      });
      const sortedDeptArr = deptArr.sort((a, b) => (a.count < b.count) ? 1 : -1);
      console.log(sortedDeptArr);
      return sortedDeptArr;
    })
    // ADD CONTENT TO DOM
    .then((sortedDeptArr) => {
      let html = '';
      const listContainer = document.getElementById('output');
      for (let i = 0; i < sortedDeptArr.length; i++) {
        html +=`<li>${sortedDeptArr[i].name}</li>
        <ul><li>${sortedDeptArr[i].avrSal}</li></ul>`;
      }
      listContainer.innerHTML = html;
    });

// HELPERS
function createPaddedZipArr(zipStart, zipEnd) {
  const zipArr = [];
  for (let i = Number(zipStart); i <= Number(zipEnd); i++) {
    const paddedZip = i.toString().padStart(5, '0');
    zipArr.push(paddedZip);
  }
  return zipArr;
}

function propsPicker(obj, props) {
  if (!obj || !props) return;
  const picked = {};
  props.forEach(function(prop) {
    picked[prop] = obj[prop];
  });
  return picked;
};
