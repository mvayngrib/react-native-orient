
# Install

```sh
npm install --save react-native-orient
```

# Usage

```js
import { makeResponsive, getDimensions } from 'react-native-orient'

export class PortraitLockedComponent extends React.Component {
  static orientation = 'portrait'
  render() {
    const dim = getDimensions(PortraitLockedComponent)
    return (
      // ...
    )
  }
}

class ResponsiveComponent extends React.Component {
  render() {
    // will rerender when orientation / dimensions change
    // this.props = {
    //   .. 
    //   orientation: 'portrait', // or 'landscape'
    //   dimensions: { width, height }
    // }
    const dim = this.props.dimensions
    return (
      // ...
    )
  }
}

ResponsiveComponent = makeResponsive(ResponsiveComponent)
export ResponsiveComponent
```
