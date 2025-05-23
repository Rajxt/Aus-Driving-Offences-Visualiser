// Loading data for choropleth
export async function loadChoropleth() {

    const geoData = await d3.json("data/aus.geojson");
    const csvData = await d3.csv("data/geo.csv");
    return [geoData, csvData];
}

// Loading data for Line Chart
export async function loadLine() {

    const natOver = await d3.csv("/data/nationaloverview.csv");
    return [natOver];
}

// LoadData.js
export async function loadBar() {
    const data = await d3.csv("AgewithMonth.csv", d => {
        return {
            month: d3.timeFormat("%Y-%m")(new Date(d.START_DATE)),
            ageGroup: d.AGE_GROUP,
            fines: +d.FINES,
            arrests: +d.ARRESTS,
            charges: +d.CHARGES
        };
    });
    return data;
}





