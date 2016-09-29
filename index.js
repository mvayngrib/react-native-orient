
import React, { Component } from 'react'
import {
  Dimensions,
  Platform
} from 'react-native'

import Orientation from 'react-native-orientation'

var orientation = Orientation.getInitialOrientation()
Orientation.addOrientationListener(o => {
  o = o.toLowerCase()
  // disallow portraitupsidedown
  if (o === 'portraitupsidedown' || o.indexOf('landscape') !== -1) {
    orientation = 'landscape'
  } else {
    orientation = 'portrait'
  }
})

export function makeResponsive (WrappedComponent) {
  return class Responsive extends Component {
    static displayName = WrappedComponent.displayName;
    constructor(props) {
      super(props)
      this._updateOrientation = this._updateOrientation.bind(this)
      this._handleResize = this._handleResize.bind(this)
      this.state = { orientation, ...getDimensions(WrappedComponent) }
    }
    componentWillMount() {
      Orientation.addOrientationListener(this._updateOrientation)
      if (Platform.OS === 'web') {
        window.addEventListener('resize', this._handleResize)
      }
    }
    componentWillUnmount() {
      Orientation.removeOrientationListener(this._updateOrientation)
      if (Platform.OS === 'web') {
        window.removeEventListener('resize', this._handleResize)
        clearTimeout(this._resizeTimeout)
      }
    }
    _handleResize() {
      orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      clearTimeout(this._resizeTimeout)
      this._resizeTimeout = setTimeout(this._updateOrientation.bind(this, orientation), 100)
    }
    _updateOrientation(orientation) {
      this.setState({ orientation, ...getDimensions(WrappedComponent) })
    }
    shouldComponentUpdate(newProps, newState) {
      for (var p in newProps) {
        if (newProps[p] !== this.props[p]) return true
      }

      for (var p in newState) {
        if (newState[p] !== this.state[p]) return true
      }

      return false
    }
    render() {
      return (
        <WrappedComponent {...this.props} {...this.state} />
      )
    }
  }
}

export function getDimensions (Component) {
  var ori = getOrientation(Component).toLowerCase()
  var { width, height } = Dimensions.get('window')
  // orientation locks may cause orientation and width/height
  // to mismatch
  //
  // if orientation is locked to PORTRAIT/LANDSCAPE (via `static orientation = 'PORTRAIT'`)
  // width vs height should reflect that
  var switchWidthHeight = Platform.OS !== 'web' && (
    (ori === 'portrait' && width > height) ||
    (ori === 'landscape' && width < height)
  )

  if (switchWidthHeight) {
    [width, height] = [height, width]
  }

  return { width, height }
}

export function getOrientation (Component) {
  return (Component && Component.orientation) || orientation
}
