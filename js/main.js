const limit = 500;
const lowZip = '01001';
const highZip = '02791';

// TODO: check it args = strings, if Numbers, convert
function createPaddedZipArr(zipStart, zipEnd) {
  const zipArr = [];
  for (let i = Number(zipStart); i <= Number(zipEnd); i++) {
    const paddedZip = i.toString().padStart(5, '0');
    zipArr.push(paddedZip);
  }
  return zipArr;
}

// function createZipURLArr(zipStart, zipEnd) {
//   urlArr = [];
//   const zipArr = createPaddedZipArr(zipStart, zipEnd);
//   zipArr.forEach((zip) => {
//     const url = `https://data.boston.gov/api/3/action/datastore_search_sql?sql=SELECT * from "31358fd1-849a-48e0-8285-e813f6efbdf1" WHERE _full_text @@ to_tsquery('${zip}') LIMIT ${limit}`;
//     urlArr.push(url);
//   });
//   return urlArr;
// };
//
// const urlArray = createZipURLArr(lowZip, highZip);
// console.log(urlArray.length);

// ZIP CODE LOOP -> get sample of DEPTS
// loop through each digit between 01001 -> 02791
// make a call to:
// `https://data.boston.gov/api/3/action/datastore_search_sql?sql=SELECT * from "31358fd1-849a-48e0-8285-e813f6efbdf1" WHERE _full_text @@ to_tsquery('${zip}') LIMIT ${limit}`

const zipCodes = createPaddedZipArr(lowZip, highZip);
for (let i = 0; i < zipCodes.length; i++) {
  fetch(`https://data.boston.gov/api/3/action/datastore_search_sql?sql=SELECT * from "31358fd1-849a-48e0-8285-e813f6efbdf1" WHERE _full_text @@ to_tsquery('${zipCodes[i]}') LIMIT ${limit}`)
      // GRAB ALL DATA
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      // CREATE AN ARRAY OF FILTERED OBJECTS FROM THE DATA
      .then((data) => {
        const records = data.result.records; // array of objects
        const filteredRecords = [];
        // provide the object and the desired properties
        // returns new object containing just those props
        const pick = (obj, props) => {
          if (!obj || !props) return;
          const picked = {};
          props.forEach(function(prop) {
            picked[prop] = obj[prop];
          });
          return picked;
        };
        // create an array containing objects w/ desired properties
        // if record is empty, skip
        records.forEach((record) => {
          filteredRecords.push(pick(record, ['POSTAL', 'TITLE', 'DEPARTMENT_NAME', 'TOTAL EARNINGS']));
        });
        return filteredRecords;
      })
      // CREATE ARRAY OF CUSTOM OBJECTS W/ DESIRED PROPS/VALS
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
        // create array of the objects
        // https://medium.com/chrisburgin/javascript-converting-an-object-to-an-array-94b030a1604c
        const deptArr = Object.keys(obj).map((i) => obj[i]);
        // when dept name matches, add count & earnings to the obj
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
        if (deptArr.length > 0) {
          console.log(`${zipCodes[i]}\n`, deptArr);
        }
      })
      .catch(console.error);
};
