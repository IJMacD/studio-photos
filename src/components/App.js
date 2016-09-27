import React from 'react'

import styles from '../styles/App.css';


export default class App extends React.Component {
  constructor () {
    super();
    
    this.state = {
      isLoading: true,
      images: [],
      lastIndex: 0,
    };

    this.serverResponse = fetch('http://192.168.0.138/studio-photos.php').then(r => r.json());

    this.loadNextData();
  }

  loadNextData () {
    this.serverResponse.then(d => {
      const lastIndex = this.state.lastIndex + 12;
      this.setState({isLoading:false, lastIndex, images: d.images.slice(0,lastIndex)});
    });
  }

  render () {
    const { isLoading, images } = this.state;

    return (
      <div>
        <div className={styles.jumbotron}>
          <h1>
            Blank Project
          </h1>
          { isLoading ? 
            <p className={styles.loading2}>Loading</p> :
            <p>Welcome to the project</p>
          }
        </div>
        <div className={styles.container}>
          <ul>
            {
              images.map(image => {
                const src = 'http://192.168.0.138/studio-photos.php?image=' + encodeURIComponent(image);
                return <li key={image}><img src={src} width="150" height="150"/></li>
              })
            }
          </ul>
          <button onClick={()=>this.loadNextData()}>Load More</button>
        </div>
      </div>
    )
  }
}