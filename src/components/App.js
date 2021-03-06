import React from 'react'
import path from 'path'

import InfiniteScroll from './InfiniteScroll';
import ImagePreview from './ImagePreview';
import Loading from './Loading';

import styles from './App.css';

let imageIndexURL = 'http://192.168.0.138/studio-photos/images.php';
let imageThumbURL = 'http://192.168.0.138/studio-photos/images.php?image=';
let imageFullURL = 'http://192.168.0.138/studio-photos/images.php?full&image=';

const SCROLL_SNAP = 200;

/**
 * @typedef Item
 * @prop {string} key
 * @prop {string} thumb
 * @prop {string} full
 * @prop {string} name
 */

/**
 * @typedef AppState
 * @prop {boolean} isLoading
 * @prop {Item[]} items
 * @prop {Item[]} filteredList
 * @prop {boolean} isScrolled
 * @prop {string} searchTerm
 * @prop {number|false} selected
 */

 /** @augments React.Component<{}, AppState> */
export default class App extends React.Component {
  constructor (props) {
    super(props);

    /** @type {AppState} */
    this.state = {
      isLoading: true,
      items: [],
      filteredList: [],
      isScrolled: false,
      searchTerm: parseHashSearch(window.location.hash),
      selected: false,
    };

    this.handleScroll = this.handleScroll.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleHashChange = this.handleHashChange.bind(this);
    this.handleKeypress = this.handleKeypress.bind(this);
  }

  /**
   *
   * @param {Item[]} items
   * @param {any} style
   * @param {number} firstIndex
   */
  renderList (items, {paddingTop, height}, firstIndex) {
    const first = items && items[firstIndex];
    return (
      <React.Fragment>
        <ul style={{ paddingTop, height }}>
          {
            items.map(item => <ListItem {...item} onClick={() => this.setState({ selected: this.findIndex(item.key) })} />)
          }
        </ul>
        { first && <div className={styles.toast}><p>{dirname(first.key)}</p></div> }
      </React.Fragment>
    );
  }

  /**
   *
   * @param {string} key
   */
  findIndex (key) {
    return this.state.filteredList.findIndex(item => item.key === key);
  }

  handleScroll () {
    const scrolled = window.scrollY > SCROLL_SNAP;
    if (this.state.isScrolled != scrolled) {
      this.setState({ isScrolled: scrolled });
    }
  }

  handleSearch (e) {
    const searchTerm = e.target.value;
    // Pre-calculate (impure-ish); TODO: use memoisation
    const filteredList = getFilteredList(this.state.items, searchTerm);
    this.setState({ searchTerm, filteredList });
  }

  handleHashChange (e) {
    const searchTerm = parseHashSearch(window.location.hash);
    // Pre-calculate (impure-ish); TODO: use memoisation
    const filteredList = getFilteredList(this.state.items, searchTerm);

    this.setState({ searchTerm, filteredList, selected: false });
  }

  handleKeypress (e) {
    let selected = this.state.selected;
    if (selected !== false) {
      if (e.which == 37) {  // ArrowLeft
        selected--;
        this.setState({ selected });
      } else if (e.which == 39) { // ArrowRight
        selected++;
        this.setState({ selected });
      } else if (e.key === "Escape") {
        this.setState({ selected: false });
      }
    }
  }

  componentDidUpdate(oldProps, oldState) {
    const { searchTerm } = this.state;
    if(searchTerm !== oldState.searchTerm) {
      window.location.hash = searchTerm ? "q=" + encodeURIComponent(searchTerm) : "";
    }
  }

  componentDidMount () {
    /** @type {(string) => Item} */
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
      // Pre-calculate (impure-ish); TODO: use memoisation
      const filteredList = getFilteredList(items, this.state.searchTerm);
      this.setState({ isLoading: false, items, filteredList });
    }).catch(() => {
      this.setState({ isLoading: false });
    });

    this.scrollCallback = window.addEventListener('scroll', this.handleScroll);
    this.hashCallback = window.addEventListener('hashchange', this.handleHashChange);
    this.keyCallback = window.addEventListener("keydown", this.handleKeypress);
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.scrollCallback);
    window.removeEventListener('hashchange', this.hashCallback);
    window.removeEventListener('keydown', this.keyCallback);
  }

  render () {
    const { isLoading, filteredList, isScrolled, searchTerm, selected } = this.state;

    const selectedItem = selected === false ? null : filteredList[Math.max(0, Math.min(selected, filteredList.length-1))];

    return (
      <div>
        <div className={isScrolled ? styles.toolbar : styles.jumbotron} >
          <h1>
            Studio Photos
          </h1>
          <p>{ `${filteredList.length} photo${(filteredList.length == 1) ? "" : "s"} ` }</p>
          <input type="search" placeholder="Search" onChange={this.handleSearch} value={searchTerm} />
        </div>
        { isLoading &&
          <p className={styles.loading}><Loading /><br />Loading</p>
        }
        <div className={styles.container} style={{marginTop: isScrolled ? SCROLL_SNAP + 48: 0, marginBottom: 48}}>
          <InfiniteScroll
            items={filteredList}
            itemHeight="156"
            itemWidth="156"
          >
            {
              this.renderList.bind(this)
            }
          </InfiniteScroll>
        </div>
        { selectedItem && <ImagePreview image={selectedItem} onClose={() => this.setState({ selected: false })} /> }
      </div>
    )
  }
}

/**
 * @param {object} props
 * @param {string} props.thumb
 * @param {string} props.full
 * @param {string} props.name
 * @param {(MouseEvent) => void} props.onClick
 */
const ListItem = (props) => {
  const { thumb, full, name, onClick } = props;
  return (
    <li>
      <a href={full} onClick={e => { e.preventDefault(); onClick(e); }} target="_blank">
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

/**
 *
 * @param {Item[]} list
 * @param {string} searchTerm
 * @return {Item[]}
 */
function getFilteredList(list, searchTerm) {
  let filteredList = list;

  if (searchTerm) {
    try {
      const searchRegex = new RegExp(searchTerm, "i");
      filteredList = list.filter(item => searchRegex.test(item.key));
    } catch (e) {
      filteredList = list.filter(item => item.key.includes(searchTerm));
    }
  }

  return filteredList;
}
