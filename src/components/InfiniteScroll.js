import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';

/**
 * @typedef InfiniteScrollProps
 * @prop {(items: any[], style: any, index: number) => React.ReactNode} children
 * @prop {any[]} items
 * @prop {number} itemHeight
 * @prop {number} itemWidth
 */

 /** @augments Component<InfiniteScrollProps> */
export default class InfiniteScroll extends Component {
  constructor (props) {
    super(props);

    this.state = {
      scrollTop: 0,
      availableHeight: 0,
      availableWidth: 0,
    }

  }

  componentDidMount () {

    this.scrollCallback = () => {
      this.setState({scrollTop: window.scrollY});
    }
    window.addEventListener("scroll", this.scrollCallback);

    this.resizeCallback = () => {
      this.setState({
        availableHeight: document.body.offsetHeight,
        availableWidth: findDOMNode(this).clientWidth,
      });
    }
    window.addEventListener("resize", this.resizeCallback);

    this.resizeCallback();
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.scrollCallback);
    window.removeEventListener("resize", this.resizeCallback);
  }

  render () {
    const { items, itemHeight, itemWidth } = this.props;
    const { scrollTop, availableHeight, availableWidth } = this.state;

    const itemsPerRow = Math.floor(availableWidth / itemWidth) || 1;

    const numRows = Math.ceil(items.length / itemsPerRow);

    const scrollBottom = scrollTop + availableHeight;

    const firstVisibleRow = Math.floor(scrollTop / itemHeight);
    const lastVisibleRow = Math.ceil(scrollBottom / itemHeight);

    const firstRow = Math.max(0, firstVisibleRow - 4);
    const lastRow = Math.min(numRows, lastVisibleRow + 4);

    const firstIndex = firstRow * itemsPerRow;
    const lastIndex = lastRow * itemsPerRow;

    const selected = items.slice(firstIndex, lastIndex);

    const style = { paddingTop: (firstRow * itemHeight), height: (itemHeight * numRows) };

    return this.props.children(selected, style, (firstVisibleRow - firstRow) * itemsPerRow);
  }
}
