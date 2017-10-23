// Generated by CoffeeScript 1.11.1

/*

UI Input Controller.

Written by Bryce Summers on May.4.2017

Purpose: 
 - Manages a bunch of UI elements and triggering their actions.
 - Handles the coloring and visual display logic for UI elements.

Notes:
 - This class has been adapted from BDS.Controller_UI.
   the only difference is our use of three.js, instead of canvas drawing.
   I think that we could abstract the canvas drawing into a scene graph 
   and then these paradigms will be more aligned.
 */

(function() {
  TSAG.UI_Controller = (function() {
    function UI_Controller(scene, camera) {
      this.scene = scene;
      this.camera = camera;
      this._mouse_pressed = false;
      this._hover_element = null;
      this._clicked_element = null;
      this._c_resting = new THREE.Color(0xe6dada);
      this._c_hover_nopress = new THREE.Color(0xfaf8f8);
      this._c_hover_pressed = new THREE.Color(0xa0a0a0);
      this._c_nohover_press = new THREE.Color(0xc7acac);
      this._active = true;
    }

    UI_Controller.prototype.setActive = function(isActive) {
      return this._active = isActive;
    };

    UI_Controller.prototype.isActive = function() {
      return this._active;
    };

    UI_Controller.prototype.mouse_down = function(event) {
      if (this._mouse_pressed) {
        return;
      }
      this._mouse_pressed = true;
      if (this._hover_element !== null) {
        this._clicked_element = this._hover_element;
        return this._clicked_element.material.color = this._c_hover_pressed;
      }
    };

    UI_Controller.prototype.mouse_move = function(event) {
      var element, polyline, pt;
      pt = new BDS.Point(event.x, event.y);
      polyline = this.scene.getUI().query_point(pt);
      element = null;
      if (polyline !== null) {
        element = polyline.getAssociatedData();
      }
      if (this._hover_element !== null) {
        this._hover_element.color = this._c_resting;
      }
      this._hover_element = element;
      if (this._hover_element !== null) {
        this._hover_element.material.color = this._c_hover_nopress;
      }
      if (this._clicked_element !== null) {
        if (this._clicked_element === this._hover_element) {
          return this._clicked_element.material.color = this._c_hover_pressed;
        } else {
          return this._clicked_element.material.color = this._c_hover_nopress;
        }
      }
    };

    UI_Controller.prototype.mouse_up = function(event) {
      if (!this._mouse_pressed) {
        return;
      }
      if (this._clicked_element === null) {
        this.finish();
        return;
      }
      if (this._hover_element === this._clicked_element) {
        this._hover_element.click();
        this._hover_element.material.color = this._c_hover_nopress;
      }
      return this.finish();
    };

    UI_Controller.prototype.time = function(dt) {};

    UI_Controller.prototype.window_resize = function(event) {};

    UI_Controller.prototype.finish = function() {
      this._mouse_pressed = false;
      return this._clicked_element = null;
    };

    return UI_Controller;

  })();

}).call(this);