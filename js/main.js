const limit = 50;
const zip = '02134';
const lowZip = '01001'
const highZip = '01101';
// const url = `https://data.boston.gov/api/3/action/datastore_search_sql?sql=SELECT * from "31358fd1-849a-48e0-8285-e813f6efbdf1" ORDER BY _id ASC LIMIT ${limit}`;
// const url = `https://data.boston.gov/api/3/action/datastore_search_sql?sql=SELECT * from "31358fd1-849a-48e0-8285-e813f6efbdf1" WHERE _id = '2' LIMIT ${limit}`;
const url = `https://data.boston.gov/api/3/action/datastore_search_sql?sql=SELECT * from "31358fd1-849a-48e0-8285-e813f6efbdf1" WHERE _full_text @@ to_tsquery('${zip}') LIMIT ${limit}`;

// ZIP CODE LOOP -> get sample of TITLESs
// loop through each digit between 01001 -> 02791
// make a call to:
// `https://data.boston.gov/api/3/action/datastore_search_sql?sql=SELECT * from "31358fd1-849a-48e0-8285-e813f6efbdf1" WHERE _full_text @@ to_tsquery('${zip}') LIMIT ${limit}`
// loop through each result - store TITLE if not already stored/saved to an array
// for (let i = lowZip; i <= highZip; i++) {
//   console.log('test');
// }


// TITLE OPTIONS
// consolidate / clean-up all titles into a few broad categories
// present options as a dropdown

// SELECTION / SEARCH
// convert keywords to search terms ("Police Officer" === "police")
// plug search term into api call

// CALCULATE RESULTS & DISPLAY
// 1) location - % of workers by zip
// 2) average pay


// window.addEventListener('load', (event) => {
//   // on load loop through zip codes
// })

fetch(url)
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

      records.forEach((record) => {
        filteredRecords.push(pick(record, ['POSTAL', 'TITLE', 'DEPARTMENT_NAME', 'TOTAL EARNINGS']));
      });
      // console.log(filteredRecords);
      return filteredRecords;
    })

    .then((filteredRecords) => {
      const arrObjs = [];
      function DeptObj(name, sumEarnings) {
        this.name = name;
        this.sumEarnings = sumEarnings;
        this.count = 0;
      }
      // intialize array with an obj
      const test = new DeptObj(filteredRecords[0].DEPARTMENT_NAME, filteredRecords[0]['TOTAL EARNINGS']);
      test.count += 1;
      arrObjs.push(test);
      // IF ARRAY IS NOT EMPTY, ADD OBJECTS
      if (arrObjs.length !== 0) {
        filteredRecords.forEach((record) => {
          arrObjs.forEach((obj) => {
            const isThere = obj.name.includes(record.DEPARTMENT_NAME);
            console.log(isThere);
          });
        });
      } else {
        const test2 = new DeptObj(record.DEPARTMENT_NAME, record['TOTAL EARNINGS']);
        test2.count += 1;
        arrObjs.push(test2);
        console.log('created new object');
      }
      console.log(arrObjs);
    })
    .catch(console.error);
