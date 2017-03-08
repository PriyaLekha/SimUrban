// Generated by CoffeeScript 1.11.1

/*
Sim Urban Topology Linked Element Generator.

Written by Bryce Summers on 3 - 7 - 2017.

Purpose
 */


/*

Polyline Graph Topology Generator.

Generates Halfedge Topology associated with Polyline Graph Data Objects.

Written by Bryce Summers
Move to its own file on 3 - 7 - 2017.
 */

(function() {
  TSAG.PolylineGraphGenerator = (function() {
    function PolylineGraphGenerator(_graph) {
      var new_edges, new_faces, new_halfedges, new_vertices;
      this._graph = _graph;
      new_faces = [];
      new_edges = [];
      new_halfedges = [];
      new_vertices = [];
    }

    PolylineGraphGenerator.prototype.allocateGraph = function() {
      this._graph = this.newGraph();
      return this._graph;
    };

    PolylineGraphGenerator.prototype.newGraph = function() {
      var output;
      output = new SCRIB.Graph(false);
      output.data = new TSAG.Graph_Data(output);
      return output;
    };

    PolylineGraphGenerator.prototype.newFace = function(graph) {
      var output;
      if (!graph) {
        graph = this._graph;
      }
      output = graph.newFace();
      output.data = new TSAG.Face_Data(output);
      this.new_faces.push(output);
      return output;
    };

    PolylineGraphGenerator.prototype.newEdge = function(graph) {
      var output;
      if (!graph) {
        graph = this._graph;
      }
      output = graph.newEdge();
      output.data = new TSAG.Edge_Data(output);
      this.new_edges.push(output);
      return output;
    };

    PolylineGraphGenerator.prototype.newHalfedge = function(graph) {
      var output;
      if (!graph) {
        graph = this._graph;
      }
      output = graph.newHalfedge();
      output.data = new TSAG.Halfedge_Data(output);
      this.new_halfedges.push(output);
      return output;
    };

    PolylineGraphGenerator.prototype.newVertex = function(graph) {
      var output;
      if (!graph) {
        graph = this._graph;
      }
      output = graph.newVertex();
      output.data = new TSAG.Vertex_Data(output);
      this.new_vertices.push(output);
      return output;
    };

    PolylineGraphGenerator.prototype.flushNewFaces = function() {
      var output;
      output = this.new_faces;
      this.new_faces = [];
      return output;
    };

    PolylineGraphGenerator.prototype.flushNewEdges = function() {
      var output;
      output = this.new_edges;
      this.new_edges = [];
      return output;
    };

    PolylineGraphGenerator.prototype.flushNewHalfedges = function() {
      var output;
      output = this.new_halfedges;
      this.new_halfedges = [];
      return output;
    };

    PolylineGraphGenerator.prototype.flushNewVertices = function() {
      var output;
      output = this.new_vertices;
      this.new_vertices = [];
      return output;
    };

    PolylineGraphGenerator.prototype.line_side_test = function(vert1, vert2, vert3) {
      var pt_c, ray;
      pt_c = vert3.data.point;
      ray = this._ray(vert1, vert2);
      return ray.line_side_test(pt_c);
    };

    PolylineGraphGenerator.prototype.vert_in_angle = function(vert_a, vert_b, vert_c, vert_pt) {
      var angle1, angle2, angle_pt, ray1, ray2, ray_pt;
      ray1 = this._ray(vert_b, vert_c);
      ray2 = this._ray(vert_b, vert_a);
      ray_pt = this._ray(vert_b, vert_pt);
      angle1 = ray1.getAngle();
      angle2 = ray2.getAngle();
      angle_pt = ray_pt.getAngle();
      if (angle2 <= angle1) {
        angle2 += Math.PI * 2;
      }
      if (angle_pt < angle1) {
        angle_pt += Math.PI * 2;
      }
      return angle1 <= angle_pt && angle_pt <= angle2;
    };

    PolylineGraphGenerator.prototype._ray = function(v1, v2) {
      var a, b, dir, ray;
      a = v1.data.point;
      b = v2.data.point;
      dir = b.sub(a);
      ray = new BDS.Ray(a, dir, 1);
      return ray;
    };

    return PolylineGraphGenerator;

  })();

}).call(this);