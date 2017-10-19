import React from 'react'
import path from 'path'

import InfiniteScroll from './InfiniteScroll.js';

import styles from '../styles/App.css';

let imageIndexURL = 'http://192.168.0.138/studio-photos/images.php';
let imageThumbURL = 'http://192.168.0.138/studio-photos/images.php?image=';
let imageFullURL = 'http://192.168.0.138/studio-photos/images.php?full&image=';

const SCROLL_SNAP = 200;

export default class App extends React.Component {
  constructor () {
    super();

    this.state = {
      isLoading: true,
      items: [],
      isScrolled: false,
      searchTerm: parseHashSearch(window.location.hash),
    };

    this.handleScroll = this.handleScroll.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleHashChange = this.handleHashChange.bind(this);
  }

  handleScroll () {
    const scrolled = window.scrollY > SCROLL_SNAP;
    if (this.state.isScrolled != scrolled) {
      this.setState({ isScrolled: scrolled });
    }
  }

  handleSearch (e) {
    this.setState({ searchTerm: e.target.value });
  }

  handleHashChange (e) {
    const searchTerm = parseHashSearch(window.location.hash);
    this.setState({ searchTerm });
  }

  componentDidUpdate(oldProps, oldState) {
    const { searchTerm } = this.state;
    if(searchTerm !== oldState.searchTerm) {
      window.location.hash = "q=" + encodeURIComponent(searchTerm);
    }
  }

  componentDidMount () {
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

    fetch(imageIndexURL).then(r => r.json()).then(d => {
      const items = d.images.map(inflateImage);
      this.setState({ isLoading: false, items });
    }).catch(() => {
      this.setState({ isLoading: false });
    });

    this.scrollCallback = window.addEventListener('scroll', this.handleScroll);
    this.hashCallback = window.addEventListener('hashchange', this.handleHashChange);
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.scrollCallback);
    window.removeEventListener('hashchange', this.hashCallback);
  }

  render () {
    const { isLoading, items, isScrolled, searchTerm } = this.state;

    let filteredList = items;

    if (searchTerm) {
      try {
        const searchRegex = new RegExp(searchTerm, "i");
        filteredList = filteredList.filter(item => searchRegex.test(item.key));
      } catch (e) {
        filteredList = filteredList.filter(item => item.key.includes(searchTerm));
      }
    }

    return (
      <div>
        <div className={isScrolled ? styles.toolbar : styles.jumbotron} >
          <h1>
            Studio Photos
          </h1>
          <p>{ `${filteredList.length}  photo${(filteredList.length == 1) ? "" : "s"} ` }</p>
          <input type="search" placeholder="Search" onChange={this.handleSearch} value={searchTerm} />
        </div>
        { isLoading &&
          <p className={styles.loading2}>Loading</p>
        }
        <div className={styles.container} style={{marginTop: isScrolled ? SCROLL_SNAP + 48: 0, marginBottom: 48}}>
          <InfiniteScroll
            items={filteredList}
            itemHeight="156"
            itemWidth="156"
          >
            {
              renderList
            }
          </InfiniteScroll>
        </div>
      </div>
    )
  }
}

const renderList = (items, {paddingTop, height}, firstIndex) => {
  const first = items && items[firstIndex];
  return [
    <ul style={{ paddingTop, height }}>
      {
        items.map(item => <ListItem {...item} />)
      }
    </ul>,
    first && <div className={styles.toast}><p>{dirname(first.key)}</p></div>
  ];
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

function dirname (p) {
  return path.basename(path.dirname(p));
}

function parseHashSearch(hash) {
  const regex = /q=([^&]*)/;
  const match = regex.exec(hash);

  if(!match || match.length < 2) return "";

  return decodeURIComponent(match[1]);
}
