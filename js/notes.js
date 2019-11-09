const limit = 500;
const zip = '02132';
const url = `https://data.boston.gov/api/3/action/datastore_search_sql?sql=SELECT * from "31358fd1-849a-48e0-8285-e813f6efbdf1" WHERE _full_text @@ to_tsquery('${zip}') LIMIT ${limit}`;

fetch(url)
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
      console.log(filteredRecords);
    })

    // ////////////////////////
    // GRAB ALL DATA
    .then((response) => {
      if (!response.ok) throw Error(response.statusText);
      return response.json();
    })
    .then((data) => {
      const allTitles = [];
      const records = data.result.records;
      for (let i = 0; i < records.length; i++) {
        allTitles.push(records[i].TITLE);
      }
      return allTitles;
    })
    // GET TOP 20 TITLES (MODE) -> RETURNS AN ARRAY
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
