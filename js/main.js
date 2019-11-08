const limit = 500;
const zip = '02132';
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
    // .then((data) => console.log(data))
    // .then((data) => console.log(data.result.records))
    // .then((data) => console.log(data.result.records[0].TITLE))
    // CREATE ARRAY OF ALL TITLES (FILTERED)
    // .then((data) => {
    //   const titleSample = [];
    //   const records = data.result.records;
    //   for (let i = 0; i < records.length; i++) {
    //     if (titleSample.indexOf(records[i].TITLE) === -1) {
    //       titleSample.push(records[i].TITLE);
    //     }
    //   }
    //   console.log(titleSample);
    //   return titleSample;
    // })
    .then((data) => {
      const allTitles = [];
      const records = data.result.records;
      for (let i = 0; i < records.length; i++) {
        allTitles.push(records[i].TITLE);
      }
      return allTitles;
    })
    // GET TOP 20 TITLES (MODE)
    .then((allTitles) => {
      // make a map
      const map = allTitles.reduce(function(acc, curr) {
        acc[curr] = ++acc[curr] || 1;
        // console.log(acc);
        return acc;
      }, {});
      // loop through object -> get array of keys/values (title/count)
      const counterArr = [];
      for (const key in map) {
        if ({}.hasOwnProperty.call(map, key)) {
          counterArr.push([key, map[key]]);
        }
      }
      // sort array by values
      counterArr.sort(function(a, b) {
        return b[1] - a[1];
      });
      // slice & map over top 20 highest, return value
      console.log(counterArr.slice(0, 20).map(function(e) {
        return e[0];
      }));
    })
    .catch(console.error);
