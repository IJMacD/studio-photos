import React from 'react';

import styles from './ImagePreview.css';

export default class ImagePreview extends React.Component {
    render () {
        const image = this.props.image;
        return (
            <div className={styles.shade} onClick={this.props.onClose}>
                <img className={styles.image} src={this.props.image} />
            </div>
        );
    }
}
