// Generated by CoffeeScript 1.11.1
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  TSAG.E_Network = (function(superClass) {
    extend(E_Network, superClass);

    function E_Network() {
      var area, graph, pline, view;
      E_Network.__super__.constructor.call(this);
      this._topology_generator = new TSAG.TopologyGenerator();
      graph = this._topology_generator.allocateGraph();
      this._topology_linker = new SCRIB.TopologyLinker(this._topology_generator, graph);
      this.setTopology(graph);
      this._roads = new Set();
      view = this.getVisual();
      this._areas = [];
      pline = BDS.Polyline.newCircle(312, 800 - 648, 58);
      area = new TSAG.E_Area(pline, "bronx", "images/stats_overlays/overlay_bronx.png");
      view.add(area.getVisual());
      this._areas.push(area);
      pline = BDS.Polyline.newCircle(1045, 800 - 656, 58);
      area = new TSAG.E_Area(pline, "queens", "images/stats_overlays/overlay_queens.png");
      view.add(area.getVisual());
      this._areas.push(area);
      pline = BDS.Polyline.newCircle(223, 800 - 205, 58);
      area = new TSAG.E_Area(pline, "manhattan", "images/stats_overlays/overlay_manhattan.png");
      view.add(area.getVisual());
      this._areas.push(area);
      pline = BDS.Polyline.newCircle(895, 800 - 210, 58);
      area = new TSAG.E_Area(pline, "booklyn", "images/stats_overlays/overlay_brooklyn.png");
      view.add(area.getVisual());
      this._areas.push(area);
    }

    E_Network.prototype.query_area_elements_pt = function(pt) {
      var ae, i, len, ref;
      ref = this._areas;
      for (i = 0, len = ref.length; i < len; i++) {
        ae = ref[i];
        if (ae.containsPoint(pt)) {
          return ae;
        }
      }
      return null;
    };

    E_Network.prototype.addRoad = function(road) {
      return this._roads.add(road);
    };

    E_Network.prototype.removeRoad = function(road) {
      var agent, agents, i, len, results;
      this._roads["delete"](road);
      agents = [];
      road.getAgents(agents);
      results = [];
      for (i = 0, len = agents.length; i < len; i++) {
        agent = agents[i];
        results.push(this.removeVisual(agent.getVisual()));
      }
      return results;
    };

    E_Network.prototype.getRoads = function() {
      var out;
      out = [];
      this._roads.forEach((function(_this) {
        return function(road) {
          return out.push(road);
        };
      })(this));
      return out;
    };

    E_Network.prototype.getGenerator = function() {
      return this._topology_generator;
    };

    E_Network.prototype.getLinker = function() {
      return this._topology_linker;
    };

    E_Network.prototype.query_elements_pt = function(x, y) {
      var element, elements, i, len, polyline, polylines, pt;
      pt = new BDS.Point(x, y);
      polylines = this._bvh.query_point_all(pt);
      elements = [];
      for (i = 0, len = polylines.length; i < len; i++) {
        polyline = polylines[i];
        element = polyline.getAssociatedData();
        if (element.containsPt(pt)) {
          elements.push(element);
        }
      }
      return elements;
    };

    E_Network.prototype.query_elements_box = function(box) {
      var elements, i, len, polyline, polylines;
      polylines = this._bvh.query_box_all(box);
      elements = [];
      for (i = 0, len = polylines.length; i < len; i++) {
        polyline = polylines[i];
        elements.push(polyline.getAssociatedData());
      }
      return elements;
    };

    return E_Network;

  })(TSAG.E_Super);

}).call(this);
