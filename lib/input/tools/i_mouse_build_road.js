// Generated by CoffeeScript 1.11.1

/*

Mouse Road building controller.

Written by Bryce Summers.
 */


/*

States:
    "idle": the road building controller is currently being unused and road building is not being performed.
    "building": legal road building is occuring.
    "illegal": road building is occuring, but it is currently illegal.
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  TSAG.I_Mouse_Build_Road = (function(superClass) {
    extend(I_Mouse_Build_Road, superClass);

    function I_Mouse_Build_Road(e_scene, camera) {
      this.e_scene = e_scene;
      this.camera = camera;
      I_Mouse_Build_Road.__super__.constructor.call(this, this.e_scene, this.camera);
      this.state = "idle";
      this._mousePrevious = {
        x: 0,
        y: 0
      };
      this._min_dist = TSAG.style.user_input_min_move;
      this.road = null;
      this.legal = false;
      this.next_point = null;
      this.network = this.e_scene.getNetwork();
      this._generator = this.network.getGenerator();
      this._linker = this.network.getLinker();
      this.isects = [];
      this.isects_last_segment = [];
      this.current_radius = TSAG.style.radius_road_local;
    }

    I_Mouse_Build_Road.mode_local = 0;

    I_Mouse_Build_Road.mode_collector = 1;

    I_Mouse_Build_Road.mode_artery = 2;

    I_Mouse_Build_Road.prototype.setMode = function(mode) {
      if (mode === this.mode_local) {
        return this.current_radius = TSAG.style.radius_road_local;
      } else if (mode === this.mode_collector) {
        return this.current_radius = TSAG.style.radius_road_collector;
      } else if (mode === this.mode_collector) {
        return this.current_radius = TSAG.style.radius_road_artery;
      } else {
        return console.log("Road build mode not supported: " + mode);
      }
    };

    I_Mouse_Build_Road.prototype.isIdle = function() {
      return this.state === "idle";
    };

    I_Mouse_Build_Road.prototype.mouse_down = function(event) {
      var dirFromPrev, dist, isect, isect_obj, j, last_isect, len1, max_length, pos, pt, ref, x, y;
      if (this.state === "illegal") {
        this.e_scene.ui_flash();
        return;
      }
      if (this.state === "idle") {
        this.road = new TSAG.E_Road();
        this.network.addVisual(this.road.getVisual());
        pt = new BDS.Point(event.x, event.y);
        isect_obj = this.classify_or_construct_intersection(pt);
        this.start_or_end_point(isect_obj);
        this.isects.push(isect_obj);
        pt = isect_obj.point;
        x = pt.x;
        y = pt.y;
        this.road.addPoint(new THREE.Vector3(x, y, 0));
        this.next_point = new THREE.Vector3(x, y + 1, 0);
        this.road.addPoint(this.next_point);
        this.road.setRevert();
        max_length = TSAG.style.discretization_length;
        this.road.updateVisual(max_length);
        this.state = "building";
        this._mousePrevious.x = event.x;
        this._mousePrevious.y = event.y;
      } else if (this.state === "building") {

        /*
        if not @legal()
             * Play an error noise, flash the road, etc.
             * Let the user know that this is an erroneous action.
            return
         */
        dist = TSAG.Math.distance(event.x, event.y, this._mousePrevious.x, this._mousePrevious.y);
        if (dist > this._min_dist) {
          pos = this.next_point;
          pos.x = Math.floor(pos.x);
          pos.y = Math.floor(pos.y);
          pt = new BDS.Point(pos.x, pos.y);
          isect_obj = this.classify_or_construct_intersection(pt);
          pos = isect_obj.point;
          this.road.updateLastPoint(pos);
          dirFromPrev = new BDS.Point(pos.x - this._mousePrevious.x, pos.y - this._mousePrevious.y);
          dirFromPrev = dirFromPrev.normalize();
          this._mousePrevious.x = pos.x;
          this._mousePrevious.y = pos.y;
          this.next_point = new THREE.Vector3(pos.x + dirFromPrev.x, pos.y + dirFromPrev.y, 0);
          this.road.addPoint(this.next_point);
          if (this.isects[this.isects.length - 1].type === 'i') {
            this.isects.pop();
          }
          ref = this.isects_last_segment;
          for (j = 0, len1 = ref.length; j < len1; j++) {
            isect = ref[j];
            this.isects.push(isect);
          }
          this.isects_last_segment = [];
          last_isect = this.isects[this.isects.length - 1];
          dist = last_isect.point.distanceTo(isect_obj.point);
          if (dist > this.road.getWidth()) {
            this.isects.push(isect_obj);
          } else if (isect_obj.isect !== void 0) {
            this.network.removeVisual(isect_obj.isect.getVisual());
          }
          this.road.setRevert();
        } else {
          this.finish();
        }
      }
    };

    I_Mouse_Build_Road.prototype.classify_or_construct_intersection = function(pt) {
      var edge, element, err, intersection, isect_pt, out, ref, road;
      element = this._getIsectOrRoadAtPt(pt);
      out = null;
      if (element instanceof TSAG.E_Intersection) {
        isect_pt = element.getPoint();
        out = {
          isect: start_element,
          type: 'p',
          point: isect_pt
        };
      } else if (element instanceof TSAG.E_Road) {
        road = element;
        ref = road.getClosePointOnCenterLine(pt), pt = ref[0], edge = ref[1];
        if (pt === null) {
          err = new Error("Pt was not actually inside of the road proper. Check you collision detection and bounds.");
          console.log(err.stack);
          debugger;
          throw err;
        }
        intersection = new TSAG.E_Intersection(pt);
        out = {
          isect: intersection,
          type: 's',
          road_edge: edge,
          point: intersection.getPoint()
        };
        this.network.addVisual(out.isect.getVisual());
      } else {
        out = {
          type: 'i',
          point: pt
        };
      }
      return out;
    };

    I_Mouse_Build_Road.prototype.start_or_end_point = function(isect_obj) {
      var intersection, pt;
      if (isect_obj.type === 'i') {
        pt = isect_obj.point;
        intersection = new TSAG.E_Intersection(pt);
        this.network.addVisual(intersection.getVisual());
        isect_obj.isect = intersection;
        return isect_obj.type = 't';
      }
    };

    I_Mouse_Build_Road.prototype.mouse_up = function(event) {};

    I_Mouse_Build_Road.prototype.mouse_move = function(event) {
      var dir, dist, i1, i2, len, p1, p2, pt, ray;
      if (this.state === "building" || this.state === "illegal") {
        this.state = "building";
        this.e_scene.ui_message("Building Road.", {
          type: 'info',
          element: this.road
        });
        dist = TSAG.Math.distance(event.x, event.y, this._mousePrevious.x, this._mousePrevious.y);
        if (dist <= this._min_dist) {
          if (this.isects.length < 2) {
            this.e_scene.ui_message("Click to cancel road.", {
              type: 'action',
              element: this.road
            });
          } else {
            this.e_scene.ui_message("Click to complete road.", {
              type: 'action',
              element: this.road
            });
          }
          return;
        }
        this.next_point.x = event.x + .01;
        this.next_point.y = event.y + .01;
        len = this.isects.length;
        if (len > 1) {
          i1 = this.isects[len - 1];
          if (i1.type !== 'i') {
            i2 = this.isects[len - 2];
            p1 = i1.point;
            p2 = i2.point;
            dir = p2.sub(p1);
            ray = new BDS.Ray(p1, dir);
            pt = this.vec_to_pt(this.next_point);
            pt = ray.projectPoint(pt);
            this.next_point = this.pt_to_vec(pt);
          }
        }
        return this.updateTemporaryRoad();
      }
    };

    I_Mouse_Build_Road.prototype.finish = function() {
      var collision_polygon, end_pt, i, isect, isect_obj, isects, j, k, l, last_isect, len, len1, len2, len3, m, max_length, obj1, obj2, ref, ref1, ref2, ref3, road, road_edge, split_isect, split_vert, type, vert, vert1, vert2, x, y;
      if (this.state !== "building") {
        return;
      }
      this.state = "idle";
      this.e_scene.ui_message("", {
        type: "info"
      });
      if (this.isects.length < 2) {
        this.cancel();
        return;
      }
      this.road.removeLastPoint();
      max_length = TSAG.style.discretization_length;
      this.road.updateDiscretization(max_length);
      end_pt = this.road.getLastPoint();
      x = end_pt.x;
      y = end_pt.y;
      last_isect = this.isects[this.isects.length - 1];
      this.start_or_end_point(last_isect);
      this.network.removeVisual(this.road.getVisual());
      this.e_scene.getUI().addCost(this.road.getCost());
      this.road = null;

      /*
      for isect_obj in @isects
          if isect_obj.type != 'p'
              @network.removeVisual(isect_obj.isect.getVisual())
       */
      ref = this.isects;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        isect_obj = ref[j];
        type = isect_obj.type;
        if (type !== 'p' && type !== 'i') {
          isect = isect_obj.isect;
          collision_polygon = isect.getCollisionPolygon();
          this.network.addCollisionPolygon(collision_polygon);
        }
      }
      ref1 = this.isects;
      for (k = 0, len2 = ref1.length; k < len2; k++) {
        isect_obj = ref1[k];
        if (isect_obj.type !== 's') {
          continue;
        }
        road_edge = isect_obj.road_edge;
        road = road_edge.data.element;
        this.network.removeVisual(road.getVisual());
        this.network.removeCollisionPolygon(road.getCollisionPolygon());
        this.network.removeRoad(road);
        split_vert = this._generator.newVertex();
        split_isect = isect_obj.isect;
        split_vert.data.point = split_isect.getPoint();
        isect_obj.type = 'p';
        split_isect.setTopology(split_vert);
        split_vert.data.element = split_isect;
        this._linker.split_edge_with_vert(road_edge, split_vert);
        isects = this._populate_split_path(road, split_vert);
        this.construct_roads_along_isect_path(isects);
      }
      ref2 = this.isects;
      for (l = 0, len3 = ref2.length; l < len3; l++) {
        isect_obj = ref2[l];
        if (isect_obj.type === 'p') {
          isect_obj.vert = isect_obj.isect.getTopology();
          continue;
        }
        vert = this._generator.newVertex();
        if (isect_obj.type !== 'i') {
          isect = isect_obj.isect;
          isect.setTopology(vert);
          vert.data.element = isect;
          vert.data.point = isect.getPoint();
        } else {
          vert.data.point = isect_obj.point;
        }
        isect_obj.vert = vert;
        continue;
      }
      len = this.isects.length;

      /*
      for i = 0; i < len - 1; i++
       */
      for (i = m = 0, ref3 = len - 1; m < ref3; i = m += 1) {
        obj1 = this.isects[i];
        obj2 = this.isects[i + 1];
        vert1 = obj1.vert;
        vert2 = obj2.vert;
        this._linker.link_verts(vert1, vert2);
      }
      this.construct_roads_along_isect_path(this.isects);

      /*
      
       * 2. Use the linker to link this graph.
      
       * 3. Create Roads and associate intersections.
       *    Associate every road with a path.
       *    The roads need to have arc curve, instead of the temporary solution that we have right now.
       *    This can come later.
      
      
       * Add the road's collision polygons to the network BVH.
       * FIXME: Add a bounding polygon instead.
      @network.addCollisionPolygons(@road.to_collision_polygons())
      
       * Make all intersections collidable.
      for isect_obj in @isects
          isect = isect_obj.isect
          @network.addCollisionPolygon(isect.getCollisionPolygon())
      
       * Embed the road topology between the list of intersections.
       * This will enable vehicles to move on the new road,
       * it will also update the areas.
      #@embedRoadTopology()
      
       * FIXME: Make a better way of managing roads.
      @network.addRoad(@road)
      
       * Preserve the road object.
      @road = null
       */
      this.isects = [];
      this.isects_last_segment = [];
    };

    I_Mouse_Build_Road.prototype.cancel = function() {
      var isect_obj, j, k, len1, len2, ref, ref1;
      if (this.road) {
        this.network.removeVisual(this.road.getVisual());
      }
      ref = this.isects_last_segment;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        isect_obj = ref[j];
        this.isects.push(isect_obj);
      }
      ref1 = this.isects;
      for (k = 0, len2 = ref1.length; k < len2; k++) {
        isect_obj = ref1[k];
        if (isect_obj.type !== 'i') {
          this.network.removeVisual(isect_obj.isect.getVisual());
        }
      }
      this.road = null;
      this.isects = [];
      return this.isects_last_segment = [];
    };

    I_Mouse_Build_Road.prototype._populate_split_path = function(road, split_vert) {
      var halfedge, isect_obj, isects, vert1, vert2, vert3;
      vert1 = road.getStartVertex();
      vert2 = split_vert;
      vert3 = road.getEndVertex();
      isects = [];
      halfedge = vert1.get_outgoing_halfedge_to(split_vert);
      if (halfedge === null) {
        halfedge = road.getHalfedge();
      }
      isect_obj = {
        isect: vert1.data.element,
        type: 'p',
        point: vert1.data.point,
        vert: vert1
      };
      isects.push(isect_obj);
      halfedge = this._append_intermediate_isects_until_vert(halfedge.next, vert2, isects);
      isect_obj = {
        isect: vert2.data.element,
        type: 's',
        point: vert2.data.point,
        vert: vert2
      };
      isects.push(isect_obj);
      halfedge = this._append_intermediate_isects_until_vert(halfedge.next, vert3, isects);
      isect_obj = {
        isect: vert3.data.element,
        type: 'p',
        point: vert3.data.point,
        vert: vert3
      };
      isects.push(isect_obj);
      return isects;
    };

    I_Mouse_Build_Road.prototype._append_intermediate_isects_until_vert = function(halfedge, stop_vert, output) {
      var c_isect, c_point, c_vert, isect_obj;
      while (true) {
        c_vert = halfedge.vertex;
        if (c_vert === stop_vert) {
          break;
        }
        c_isect = c_vert.data.element;
        c_point = c_vert.data.point;
        isect_obj = {
          isect: c_isect,
          type: 'i',
          point: c_point,
          vert: c_vert
        };
        output.push(isect_obj);
        halfedge = halfedge.next;
      }
      return halfedge;
    };

    I_Mouse_Build_Road.prototype.construct_roads_along_isect_path = function(isects) {
      var _road, edge, halfedge, i, isect_obj, j, prev_isect_obj, ref, vert, vert_prev;
      _road = new TSAG.E_Road();
      this.network.addVisual(_road.getVisual());
      _road.addPoint(isects[0].point);
      _road.setStartVertex(isects[0].vert);
      for (i = j = 1, ref = isects.length; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
        isect_obj = isects[i];
        prev_isect_obj = isects[i - 1];
        vert_prev = prev_isect_obj.vert;
        vert = isect_obj.vert;
        halfedge = vert_prev.get_outgoing_halfedge_to(vert);
        edge = halfedge.edge;
        edge.data.element = _road;
        _road.addPoint(isect_obj.point);
        if (_road.getHalfedge() === null) {
          _road.setHalfedge(halfedge);
        }
        if (isect_obj.type === 'i') {
          vert.data.element = _road;
          continue;
        }
        _road.setEndVertex(vert);
        _road.updateDiscretization(TSAG.style.discretization_length);
        this.network.addCollisionPolygon(_road.getCollisionPolygon());
        this.network.addRoad(_road);
        _road = null;
        if (isect_obj.type === 't') {
          break;
        }
        _road = new TSAG.E_Road();
        this.network.addVisual(_road.getVisual());
        _road.addPoint(isect_obj.point);
        _road.setStartVertex(vert);
        continue;
      }
    };

    I_Mouse_Build_Road.prototype.updateTemporaryRoad = function() {
      var max_length;
      this.destroyLastSegmentIsects();
      this.road.updateLastPoint(this.next_point);
      max_length = TSAG.style.discretization_length;
      this.road.updateDiscretization(max_length);
      if (!this.checkLegality()) {
        this.road.revert();
        this.road.updateDiscretization(max_length);
        this.road.setFillColor(TSAG.style.error);
        this.legal = false;
        return;
      }
      this.road.revertFillColor();
      this.legal = true;
      this.legal = this.createTempIntersections();
      if (this.legal) {
        return this.road.updateDiscretization(max_length);
      }
    };

    I_Mouse_Build_Road.prototype.destroyLastSegmentIsects = function() {
      var collision_polygon, isect, isect_obj, j, len1, ref;
      this.road.revert();
      ref = this.isects_last_segment;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        isect_obj = ref[j];
        if (isect_obj.type !== 's') {
          continue;
        }
        isect = isect_obj.isect;
        this.network.removeVisual(isect.getVisual());
        collision_polygon = isect.getCollisionPolygon();
        this.network.removeCollisionPolygon(collision_polygon);
      }
      return this.isects_last_segment = [];
    };

    I_Mouse_Build_Road.prototype.checkLegality = function() {
      var collision_polygon, last_point, penultimate_index, pline, query_box;
      pline = this.road.getCenterPolyline();
      penultimate_index = pline.size() - 2;
      last_point = pline.getPoint(penultimate_index);
      if (this.next_point.distanceTo(last_point) < this.current_radius * 2) {
        this.e_scene.ui_message("Error: Segment is not long enough!", {
          type: "error",
          element: this.road
        });
        this.state = "illegal";
        return false;
      }
      collision_polygon = this.road.generateCollisionPolygon();
      query_box = collision_polygon.generateBoundingBox();
      return true;
    };

    I_Mouse_Build_Road.prototype.createTempIntersections = function() {
      var dir1, dir1_norm, dir2, e_polyline, e_road, elem, elements, far_enough, isect_obj, j, last_intersection_point, last_point, len, len1, par_projection, perp_projection, polyline, pt1, pt2, pt3, query_box, temp_polyline;
      polyline = this.road.getCenterPolyline();
      temp_polyline = polyline.getLastSegment();
      query_box = temp_polyline.generateBoundingBox();
      elements = this.network.query_elements_box(query_box);
      for (j = 0, len1 = elements.length; j < len1; j++) {
        elem = elements[j];
        if (elem instanceof TSAG.E_Road) {
          e_polyline = elem.getCenterPolyline();
          this._intersectPolygons(e_polyline, temp_polyline, elem);
        }
      }
      this._sortIsects(this.isects_last_segment, temp_polyline.getFirstPoint());
      last_point = temp_polyline.getLastPoint();
      far_enough = true;
      if (this.isects_last_segment.length > 0) {
        last_intersection_point = this.isects_last_segment[this.isects_last_segment.length - 1].point;
        far_enough = last_intersection_point.distanceTo(last_point) > this.road.getWidth();
      }
      e_road = this._getRoadAtPt(last_point);
      if (e_road !== null && far_enough) {
        isect_obj = this.classify_or_construct_intersection(last_point);
        this.network.addVisual(isect_obj.isect.getVisual());
        this.isects_last_segment.push(isect_obj);
      }
      if (this.isects.length >= 2 && this.isects[this.isects.length - 1].type === 'i') {
        len = this.isects.length;
        pt1 = this.isects[len - 2].point;
        pt2 = this.isects[len - 1].point;
        if (this.isects_last_segment.length > 0) {
          pt3 = this.isects_last_segment[0].point;
        } else {
          pt3 = last_point;
        }
        dir1 = pt1.sub(pt2);
        dir2 = pt3.sub(pt2);
        if (dir1.angleBetween(dir2) + .00001 < Math.PI / 2) {
          if (e_road !== null) {
            this.road.revert();
            this.e_scene.ui_message("Error: Curve is too sharp!", {
              type: "error",
              element: this.road
            });
            this.state = "illegal";
            return;
          }
          this.road.revert();
          pt3 = last_point;
          dir2 = pt3.sub(pt2);
          dir1_norm = dir1.normalize();
          par_projection = dir1_norm.multScalar(dir2.dot(dir1_norm));
          perp_projection = dir2.sub(par_projection);
          if (perp_projection.norm() < this.current_radius * 2) {
            this.road.updateDiscretization(TSAG.style.discretization_length);
            this.e_scene.ui_message("Error: Curve is too sharp!", {
              type: "error",
              element: this.road
            });
            this.state = "illegal";
            return false;
          }
          this.next_point = pt2.add(perp_projection);
          this.updateTemporaryRoad();
          return false;
        }
        this.road.removeLastPoint();
        last_point = this.road.removeLastPoint();
        this._createTempCurve(pt1, pt2, pt3);
        this.road.addPoint(this.next_point);
      }
      return true;
    };

    I_Mouse_Build_Road.prototype._sortIsects = function(isect_array, start_pt) {
      var compare_func, dist, i, isect, j, k, len1, pt, ref, sort_array;
      sort_array = [];
      for (j = 0, len1 = isect_array.length; j < len1; j++) {
        isect = isect_array[j];
        pt = isect.point;
        dist = start_pt.distanceTo(pt);
        sort_array.push({
          key: dist,
          val: isect
        });
      }
      compare_func = function(a, b) {
        return a.key - b.key;
      };
      sort_array.sort(compare_func);
      for (i = k = 0, ref = isect_array.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
        isect_array[i] = sort_array[i].val;
      }
      return isect_array;
    };

    I_Mouse_Build_Road.prototype._createTempCurve = function(pt0, pt1, pt2) {
      var prefix;
      prefix = this._arc(pt0, pt1, pt2, this.current_radius);
      this.isects_last_segment = prefix.concat(this.isects_last_segment);
    };

    I_Mouse_Build_Road.prototype._arc = function(pt0, pt1, pt2, radius) {
      var angle, angle1, angle2, angle_diff, arc_center_pt, arc_length, curve_pts, dir01, dir21, i, isect_obj, isects, j, k, len, len1, offset_pt0, offset_pt2, offset_ray01, offset_ray21, orientation, perp_dir_pt0, perp_dir_pt2, pt, ray01, ray21, ref, seg_length, temp;
      dir01 = pt1.sub(pt0);
      dir21 = pt1.sub(pt2);
      ray01 = new BDS.Ray(pt0, dir01);
      ray21 = new BDS.Ray(pt2, dir21);
      orientation = ray01.line_side_test(pt2);
      orientation = BDS.Math.sign(orientation);
      if (orientation === 0) {
        return [];
      }
      perp_dir_pt0 = ray01.getRightPerpendicularDirection().multScalar(orientation);
      perp_dir_pt0 = perp_dir_pt0.normalize();
      offset_pt0 = pt0.add(perp_dir_pt0.multScalar(radius));
      perp_dir_pt2 = ray21.getLeftPerpendicularDirection().multScalar(orientation);
      perp_dir_pt2 = perp_dir_pt2.normalize();
      offset_pt2 = pt2.add(perp_dir_pt2.multScalar(radius));
      offset_ray01 = new BDS.Ray(offset_pt0, dir01);
      offset_ray21 = new BDS.Ray(offset_pt2, dir21);
      arc_center_pt = offset_ray01.intersect_ray(offset_ray21);
      if (arc_center_pt === null) {
        return [];
      }
      angle1 = perp_dir_pt0.multScalar(-1).angle();
      angle2 = perp_dir_pt2.multScalar(-1).angle();
      seg_length = TSAG.style.discretization_length;
      curve_pts = [];
      if (orientation < 0) {
        temp = angle1;
        angle1 = angle2;
        angle2 = temp;
      }
      if (angle2 < angle1) {
        angle2 += Math.PI * 2;
      }
      angle_diff = angle2 - angle1;
      arc_length = radius * angle_diff;
      len = Math.ceil(arc_length / seg_length);
      for (i = j = 0, ref = len; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        angle = angle1 + i * (angle2 - angle1) / len;
        pt = BDS.Point.directionFromAngle(angle);
        curve_pts.push(arc_center_pt.add(pt.multScalar(radius)));
      }
      if (orientation < 0) {
        curve_pts = curve_pts.reverse();
      }
      isects = [];
      for (k = 0, len1 = curve_pts.length; k < len1; k++) {
        pt = curve_pts[k];
        isect_obj = {
          type: 'i',
          point: pt
        };
        isects.push(isect_obj);
        this.road.addPoint(this.pt_to_vec(pt));
      }
      return isects;
    };

    I_Mouse_Build_Road.prototype._quadraticBezier = function(pt0, pt1, pt2) {
      var b1, b2, d1, d2, d3, isect_obj, isects, j, pt, t, time;
      isects = [];
      d1 = pt1.sub(pt0);
      d2 = pt2.sub(pt1);
      for (t = j = 1; j < 10; t = ++j) {
        time = t / 10.0;
        b1 = pt0.add(d1.multScalar(time));
        b2 = pt1.add(d2.multScalar(time));
        d3 = b2.sub(b1);
        pt = b1.add(d3.multScalar(time));
        isect_obj = {
          type: 'i',
          point: pt
        };
        isects.push(isect_obj);
        this.road.addPoint(this.pt_to_vec(pt));
      }
      return isects;
    };

    I_Mouse_Build_Road.prototype.vec_to_pt = function(vec) {
      var x, y, z;
      x = vec.x;
      y = vec.y;
      z = vec.z;
      return new BDS.Point(x, y, z);
    };

    I_Mouse_Build_Road.prototype.pt_to_vec = function(pt) {
      var x, y, z;
      x = pt.x;
      y = pt.y;
      z = pt.z;
      return new THREE.Vector3(x, y, z);
    };

    I_Mouse_Build_Road.prototype._intersectPolygons = function(perm_poly, new_poly, road_in_embedding) {
      var data, edge, edge_index, halfedge, i, intersection, isect_datas, isect_obj, j, k, len1, pt, ref;
      isect_datas = perm_poly.report_intersections_with_polyline(new_poly);
      for (j = 0, len1 = isect_datas.length; j < len1; j++) {
        data = isect_datas[j];
        pt = data.point;
        edge_index = data.index;
        halfedge = road_in_embedding.getHalfedge();
        for (i = k = 0, ref = edge_index; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
          halfedge = halfedge.next;
        }
        edge = halfedge.edge;
        intersection = new TSAG.E_Intersection(pt);
        isect_obj = {
          isect: intersection,
          type: 's',
          road_edge: edge,
          point: intersection.getPoint()
        };
        this.isects_last_segment.push(isect_obj);
        this.network.addVisual(intersection.getVisual());
      }

      /*
       * Add intersections every time the mouse cursor intersects an older road.
      road_model = @network.query_road(event.x, event.y)
      if road_model != null
          @network.newIntersection(road_model.getPosition())
       */
    };

    I_Mouse_Build_Road.prototype._getIsectOrRoadAtPt = function(pt) {
      var elem, elems, j, k, len1, len2;
      elems = this.network.query_elements_pt(pt.x, pt.y);
      for (j = 0, len1 = elems.length; j < len1; j++) {
        elem = elems[j];
        if (elem instanceof TSAG.E_Intersection) {
          return elem;
        }
      }
      for (k = 0, len2 = elems.length; k < len2; k++) {
        elem = elems[k];
        if (elem instanceof TSAG.E_Road) {
          return elem;
        }
      }
      return null;
    };

    I_Mouse_Build_Road.prototype._getRoadAtPt = function(pt) {
      var elem, elems, j, len1;
      elems = this.network.query_elements_pt(pt.x, pt.y);
      for (j = 0, len1 = elems.length; j < len1; j++) {
        elem = elems[j];
        if (elem instanceof TSAG.E_Road) {
          return elem;
        }
      }
      return null;
    };

    return I_Mouse_Build_Road;

  })(TSAG.I_Tool_Controller);

}).call(this);
