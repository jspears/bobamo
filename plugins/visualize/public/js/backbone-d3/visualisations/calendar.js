define(['Backbone.d3', 'd3'], function (Backbone, d3) {
    var Calendar = Backbone.d3.Canned.Calendar = {};

    Calendar.View = Backbone.d3.PlotView.extend({
        day:d3.time.format("%w"),
        week:d3.time.format("%U"),
        percent:d3.format(".1%"),
        format:d3.time.format("%Y-%m-%d"),
        m:[19, 20, 20, 19], // top right bottom left margin
        gw:700, // width
        gh:136, // height
        z:10, // cell size
        plot:function (options, plotdata) {
            var that = this;
            var w = 700 - this.m[1] - this.m[3], // width
                h = 136 - this.m[0] - this.m[2];
            var color = d3.scale.quantize()
                .domain([0, 1])
                .range(d3.range(9));

            var svg = this.div.selectAll("svg")
                .data(d3.range(this.minYear, this.maxYear))
                .enter().append("svg:svg")
                .attr("width", w + this.m[1] + this.m[3])
                .attr("height", h + this.m[0] + this.m[2])
                .attr("class", "RdYlGn")// Colour pallet.
                .append("svg:g")
                .attr("transform",
                "translate(" + (this.m[3] + (w - this.z * 53) / 2) + "," + (this.m[0] + (h - this.z * 7) / 2) + ")");

            svg.append("svg:text")
                .attr("transform", "translate(-6," + this.z * 3.5 + ")rotate(-90)")
                .attr("text-anchor", "middle")
                .text(String);

            var rect = svg.selectAll("rect.day")
                .data(function (d) {
                    return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
                })
                .enter().append("svg:rect")
                .attr("class", "day")
                .attr("width", this.z)
                .attr("height", this.z)
                .attr("x", function (d) {
                    return that.week(d) * that.z;
                })
                .attr("y", function (d) {
                    return that.day(d) * that.z;
                });

            svg.selectAll("path.month")
                .data(function (d) {
                    return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));
                })
                .enter().append("svg:path")
                .attr("class", "month")
                .attr("d", that.monthPath);

            var data = d3.nest()
                .key(function (d) {
                    return d.date;
                })
                .rollup(function (d) {
                    return d[0].count;
                })
                .map(plotdata);

            rect.attr("class", function (d) {
                return "day q" + color(data[that.format(d)]) + "-9";
            })
                .append("svg:title")
                .text(function (d) {
                    return (d = that.format(d)) + (d in data ? ": " + that.percent(data[d]) : "");
                });
        },
        plotdata:function () {
            // return percent safety

            var max = _.max(this.collection.pluck('count'));
            this.minYear = 0;
            this.maxYear = 0;
            var fmt = d3.time.format("%Y-%m-%d");
            var data = this.collection.map(function (datapoint) {
                var date = datapoint.get('date');
                var year = fmt.parse(date).getUTCFullYear();
                this.minYear = (this.minYear == 0) ? year : Math.min(this.minYear, year);
                this.maxYear = (this.maxYear == 0) ? year : Math.max(this.maxYear, year);
                return {date:date, count:1 - parseFloat(datapoint.get('count')) / max}
            }, this)
            if (this.minYear == this.maxYear) this.maxYear++;
            return data;
        },
        monthPath:function (t0) {
            var t1 = new Date(t0.getUTCFullYear(), t0.getUTCMonth() + 1, 0),
                d0 = +this.day(t0), w0 = +this.week(t0),
                d1 = +this.day(t1), w1 = +this.week(t1);
            return "M" + (w0 + 1) * this.z + "," + d0 * this.z
                + "H" + w0 * this.z + "V" + 7 * this.z
                + "H" + w1 * this.z + "V" + (d1 + 1) * this.z
                + "H" + (w1 + 1) * this.z + "V" + 0
                + "H" + (w0 + 1) * this.z + "Z";
        }
    }),
        Calendar.Model = Backbone.Model.extend({
            initialize:function (data) {
                this.set({
                    date:data.date,
                    count:data.count
                });
            }
        }),
        Calendar.Collection =
            Backbone.d3.PlotCollection.extend({
                model:Calendar.Model,
                url:"calendar.json",
                plottype:'calendar'

            })
    return Calendar;
});