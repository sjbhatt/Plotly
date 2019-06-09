function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
    // Use d3 to select the panel with id of `#sample-metadata`

    // Use `.html("") to clear any existing metadata

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);

  var url = "/metadata/" + sample ;
  d3.json(url).then(function(response) {
    // console.log (response);
    // console.log (Object.entries(response));

    var metadataPanel = d3.select("#sample-metadata");
    metadataPanel.html("");
    Object.entries(response).forEach(function ([key, value]) {
      var row = metadataPanel.append("p");
      row.text(`${key} : ${value}`);
      // row.append("hr")
  });
});
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots

    // @TODO: Build a Bubble Chart using the sample data

    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).

  var url = "/samples/" + sample ;
  d3.json(url).then(function(response) {
    var raw_data = [response];
    var samplevalues = raw_data[0].sample_values;
    var otuids = raw_data[0].otu_ids;
    var otulabels = raw_data[0].otu_labels
    // console.log(`Sample Values ${samplevalues}`);
    // console.log(`Otu IDs ${otuids}`);
    // console.log(`Otu Labels ${otulabels}`);

    var sample_data =[];

    for (var i = 0; i < samplevalues.length; i++) {
      var data = { "sample_values" : samplevalues[i],
          "otu_ids" : otuids[i],
          "otu_labels" : otulabels[i]
        }
        sample_data.push(data);
    }

    // console.log(sample_data);

    sample_data.sort(function (a, b) {
      return b.sample_values - a.sample_values
    });
    // console.log(sample_data);
    // console.log(sample_data[0].sample_values);
    // console.log(sample_data[0].otu_ids);
    // console.log(sample_data[0].otu_labels);

    var top_10 = sample_data.slice(0,10);
    // console.log(top_10);

    var pie_labels = top_10.map(label => label.otu_ids);
    // console.log(pie_labels);
    var pie_values = top_10.map(value => value.sample_values);
    // console.log(pie_values);
    var pie_hovertexts = top_10.map(hovertext => hovertext.otu_labels);
    // console.log(pie_hovertexts);

    var pie_trace = {
      labels: pie_labels,
      values: pie_values,
      type: 'pie',
      hovertext : pie_hovertexts
      };
  
    var data = [pie_trace];
  
    var layout = {
      height: 500,
      width: 500,
      title: '<b> Belly Button Pie Chart for Top 10 Samples </b>'
  };
  
  Plotly.newPlot("pie", data, layout);

  var bubble_trace = {
    x: otuids,
    y: samplevalues,
    mode: 'markers',
    marker: {
      size: samplevalues,
      sizeref: 1.5,
      color: otuids,
      colorscale: 'Portland',
    },
    text: otulabels
  };
  
  var data = [bubble_trace];
  
  var layout = {
    title:"<b> Belly Button Bubble Chart </b>",
    xaxis: { title: 'OTU ID'},
    yaxis: { title: 'Sample Value'},
    height: 800,
    width: 1200
  };
  
  Plotly.newPlot('bubble', data, layout);

});


  

}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
