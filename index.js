
import React, { Component } from 'react'
import {
  Dimensions,
  Platform
} from 'react-native'

import Orientation from 'react-native-orientation'

var orientation = Orientation.getInitialOrientation()
Orientation.addOrientationListener(o => {
  orientation = normalize(o)
})

exports.makeResponsive = makeResponsive
exports.getOrientation = getOrientation
exports.getDimensions = getDimensions

function makeResponsive (WrappedComponent) {
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
      orientation = window.innerWidth > window.innerHeight ? 'LANDSCAPE' : 'PORTRAIT'
      clearTimeout(this._resizeTimeout)
      this._resizeTimeout = setTimeout(this._updateOrientation.bind(this, orientation), 100)
    }
    _updateOrientation(orientation) {
      if (orientation.toUpperCase() !== 'UNKNOWN') {
        orientation = normalize(orientation)
        this.setState({ orientation, ...getDimensions(WrappedComponent) })
      }
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

function getDimensions (Component) {
  var ori = normalize(getOrientation(Component))
  var { width, height } = Dimensions.get('window')
  // orientation locks may cause orientation and width/height
  // to mismatch
  //
  // if orientation is locked to PORTRAIT/LANDSCAPE (via `static orientation = 'PORTRAIT'`)
  // width vs height should reflect that
  var switchWidthHeight = Platform.OS !== 'web' && (
    (ori === 'PORTRAIT' && width > height) ||
    (ori === 'LANDSCAPE' && width < height)
  )

  if (switchWidthHeight) {
    [width, height] = [height, width]
  }

  return { width, height }
}

function getOrientation (Component) {
  return (Component && Component.orientation) || orientation
}

function normalize (o) {
  o = o.toUpperCase()
  // disallow portraitupsidedown
  if (o === 'PORTRAITUPSIDEDOWN' || o.indexOf('LANDSCAPE') !== -1) {
    return 'LANDSCAPE'
  } else {
    return 'PORTRAIT'
  }
}
