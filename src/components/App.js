import React from 'react'

import InfiniteScroll from './InfiniteScroll.js';

import styles from '../styles/App.css';

let imageIndexURL = 'http://192.168.0.138/studio-photos/images.php';
let imageThumbURL = 'http://192.168.0.138/studio-photos/images.php?image=';
let imageFullURL = 'http://192.168.0.138/studio-photos/images.php?full&image=';

if(process.env.NODE_ENV != "production") {
  imageIndexURL = '/images.json';
}

export default class App extends React.Component {
  constructor () {
    super();

    this.state = {
      isLoading: true,
      items: [],
      isScrolled: false,
    };

    let inflateImage = img => {
      const slashIndex = img.lastIndexOf('/') + 1;
      const encodedURI = encodeURIComponent(img);
      return {
        key: img,
        thumb: imageThumbURL + encodedURI,
        full: imageFullURL + encodedURI,
        name: img.substr(slashIndex, img.lastIndexOf('.') - slashIndex),
      }
    };

    if (process.env.NODE_ENV != "production") {
      inflateImage = (img, i) => {
        const slashIndex = img.lastIndexOf('/') + 1;
        return {
          key: img + i,
          thumb: img,
          full: img,
          name: img.substr(slashIndex),
        }
      }
    }

    fetch(imageIndexURL).then(r => r.json()).then(d => {
      const items = d.images.map(inflateImage);
      this.setState({isLoading: false, items});
    });

    this.handleScroll = this.handleScroll.bind(this);
  }

  handleScroll () {
    const scrolled = window.scrollY > 20;
    if (this.state.isScrolled != scrolled) {
      this.setState({ isScrolled: scrolled });
    }
  }

  componentDidMount () {
    this.scrollCallback = window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.scrollCallback);
  }

  render () {
    const { isLoading, items, isScrolled } = this.state;

    return (
      <div>
        <div className={isScrolled ? styles.toolbar : styles.jumbotron} >
          <h1>
            Studio Photos
          </h1>
        </div>
        { isLoading &&
          <p className={styles.loading2}>Loading</p>
        }
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
