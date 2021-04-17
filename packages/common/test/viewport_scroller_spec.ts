/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {describe, expect, it} from '@angular/core/testing/src/testing_internal';
import {browserDetection} from '@angular/platform-browser/testing/src/browser_util';
import {BrowserViewportScroller, ViewportScroller} from '../src/viewport_scroller';

describe('BrowserViewportScroller', () => {
  describe('setHistoryScrollRestoration', () => {
    let scroller: ViewportScroller;
    let windowSpy: any;

    beforeEach(() => {
      windowSpy =
          jasmine.createSpyObj('window', ['history', 'scrollTo', 'pageXOffset', 'pageYOffset']);
      windowSpy.history.scrollRestoration = 'auto';
      scroller = new BrowserViewportScroller(document, windowSpy);
    });

    function createNonWritableScrollRestoration() {
      Object.defineProperty(windowSpy.history, 'scrollRestoration', {
        value: 'auto',
        configurable: true,
      });
    }

    it('should not crash when scrollRestoration is not writable', () => {
      createNonWritableScrollRestoration();
      expect(() => scroller.setHistoryScrollRestoration('manual')).not.toThrow();
    });

    it('should still allow scrolling if scrollRestoration is not writable', () => {
      createNonWritableScrollRestoration();
      scroller.scrollToPosition([10, 10]);
      expect(windowSpy.scrollTo as jasmine.Spy).toHaveBeenCalledWith(10, 10);
    });
  });

  describe('scrollToAnchor', () => {
    // Testing scroll behavior does not make sense outside a browser
    if (isNode) return;
    const anchor = 'anchor';
    let scroller: BrowserViewportScroller;

    beforeEach(() => {
      scroller = new BrowserViewportScroller(document, window);
      scroller.scrollToPosition([0, 0]);
    });

    it('should scroll when element with matching id is found', () => {
      const {anchorNode, cleanup} = createTallElement();
      anchorNode.id = anchor;
      scroller.scrollToAnchor(anchor);
      expect(scroller.getScrollPosition()[1]).not.toEqual(0);
      cleanup();
    });

    it('should scroll when anchor with matching name is found', () => {
      const {anchorNode, cleanup} = createTallElement();
      anchorNode.name = anchor;
      scroller.scrollToAnchor(anchor);
      expect(scroller.getScrollPosition()[1]).not.toEqual(0);
      cleanup();
    });

    it('should not scroll when no matching element is found', () => {
      const {cleanup} = createTallElement();
      scroller.scrollToAnchor(anchor);
      expect(scroller.getScrollPosition()[1]).toEqual(0);
      cleanup();
    });

    it('should scroll when element with matching id is found inside the shadow DOM', () => {
      // This test is only relevant for browsers that support shadow DOM.
      if (!browserDetection.supportsShadowDom) {
        return;
      }

      const {anchorNode, cleanup} = createTallElementWithShadowRoot();
      anchorNode.id = anchor;
      scroller.scrollToAnchor(anchor);
      expect(scroller.getScrollPosition()[1]).not.toEqual(0);
      cleanup();
    });

    it('should scroll when anchor with matching name is found inside the shadow DOM', () => {
      // This test is only relevant for browsers that support shadow DOM.
      if (!browserDetection.supportsShadowDom) {
        return;
      }

      const {anchorNode, cleanup} = createTallElementWithShadowRoot();
      anchorNode.name = anchor;
      scroller.scrollToAnchor(anchor);
      expect(scroller.getScrollPosition()[1]).not.toEqual(0);
      cleanup();
    });

    function createTallElement() {
      const tallItem = document.createElement('div');
      tallItem.style.height = '3000px';
      document.body.appendChild(tallItem);
      const anchorNode = createAnchorNode();
      document.body.appendChild(anchorNode);

      return {
        anchorNode,
        cleanup: () => {
          document.body.removeChild(tallItem);
          document.body.removeChild(anchorNode);
        }
      };
    }

    function createTallElementWithShadowRoot() {
      const tallItem = document.createElement('div');
      tallItem.style.height = '3000px';
      document.body.appendChild(tallItem);

      const elementWithShadowRoot = document.createElement('div');
      const shadowRoot = elementWithShadowRoot.attachShadow({mode: 'open'});
      const anchorNode = createAnchorNode();
      shadowRoot.appendChild(anchorNode);
      document.body.appendChild(elementWithShadowRoot);

      return {
        anchorNode,
        cleanup: () => {
          document.body.removeChild(tallItem);
          document.body.removeChild(elementWithShadowRoot);
        }
      };
    }

    function createAnchorNode() {
      const anchorNode = document.createElement('a');
      anchorNode.innerText = 'some link';
      anchorNode.href = '#';
      return anchorNode;
    }
  });
});
