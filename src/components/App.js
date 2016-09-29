import React from 'react'

import InfiniteScroll from './InfiniteScroll.js';

import styles from '../styles/App.css';

export default class App extends React.Component {
  constructor () {
    super();
    
    this.state = {
      isLoading: true,
      items: [],
    };

    fetch('http://192.168.0.138/studio-photos/images.php').then(r => r.json()).then(d => {
      const items = d.images.map(img => {
        const slashIndex = img.lastIndexOf('/') + 1;
        const encodedURI = encodeURIComponent(img);
        return {
          key: img,
          thumb: 'http://192.168.0.138/studio-photos/images.php?image=' + encodedURI,
          full: 'http://192.168.0.138/studio-photos/images.php?full&image=' + encodedURI,
          name: img.substr(slashIndex, img.lastIndexOf('.') - slashIndex),
        }
      });
      this.setState({isLoading: false, items});
    });
  }

  render () {
    const { isLoading, items } = this.state;

    return (
      <div>
        <div className={styles.jumbotron}>
          <h1>
            Studio Photos
          </h1>
          { isLoading &&
            <p className={styles.loading2}>Loading</p>
          }
        </div>
        <div className={styles.container}>
          <InfiniteScroll
            items={items}
            ItemComponent={ListItem}
            WrapComponent="ul"
            itemHeight="156"
            itemWidth="156"
          />
        </div>
      </div>
    )
  }
}

const ListItem = (props) => {
  const { thumb, full, name } = props;
  return (
    <li>
      <a href={full} target="_blank">
        <img src={thumb} width="150" height="150" />
        <p>{ name }</p>
      </a>
    </li>);
}