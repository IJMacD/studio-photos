import React, { Component } from 'react';

export default class InfiniteScroll extends Component {
  constructor () {
    super();

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
        availableWidth: document.body.offsetWidth,
      });
    }
    window.addEventListener("resize", this.resizeCallback);
    
    this.resizeCallback();
  }

  componentWillUnmount() {
    if(this.scrollCallback){
      window.removeEventListener("scroll", this.scrollCallback);
    }
    if(this.resizeCallback){
      window.removeEventListener("resize", this.resizeCallback);
    }
  }

  render () {
    const { items, ItemComponent, WrapComponent, itemHeight, itemWidth } = this.props;
    const { scrollTop, availableHeight, availableWidth } = this.state;

    const itemsPerRow = Math.floor(availableWidth / itemWidth) || 1;

    const numRows = items.length / itemsPerRow;

    const scrollBottom = scrollTop + availableHeight;

    const firstRow = Math.max(0, Math.floor(scrollTop / itemHeight) - 4);
    const lastRow = Math.min(numRows, Math.ceil(scrollBottom / itemHeight) + 4);

    const firstIndex = firstRow * itemsPerRow;
    const lastIndex = lastRow * itemsPerRow;

    const selected = items.slice(firstIndex, lastIndex);

    return (
      <WrapComponent style={{paddingTop: (firstRow * itemHeight), height: (itemHeight * numRows)}}>
      {
        selected.map(item => (
          <ItemComponent key={item.key} {...item} />
        ))
      }
      </WrapComponent>
    )
  }
}