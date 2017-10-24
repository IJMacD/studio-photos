import React from 'react';
import EXIF from 'exif-js';
import path from 'path';

import styles from './ImagePreview.css';

export default class ImagePreview extends React.Component {
    constructor() {
        super();

        this.state = {
            exif: null,
        };

        this.img = new Image();
        this.img.onload = () => {
            const self = this;
            EXIF.getData(this.img, function () {
                const exif = EXIF.getAllTags(this);
                console.log(exif);
                self.setState({ exif });
            });
        };
    }
    componentWillReceiveProps() {
        this.img.src = this.props.image;
    }
    componentDidMount() {
        this.img.src = this.props.image;
    }
    render () {
        const image = this.props.image;
        const exif = this.state.exif;
        const filename = path.basename(decodeURIComponent(image));

        return (
            <div className={styles.shade} onClick={this.props.onClose}>
                <img className={styles.image} src={this.props.image} />
                <div className={styles.metabox} onClick={e => e.stopPropagation()}>
                    {exif && <EXIFData exif={exif} /> }
                    <a href={image} download={filename} target="_blank">
                        <Icon name="file_download" style={{color: 'white'}} title="Download" />
                    </a>
                </div>
            </div>
        );
    }
}

const EXIFData = ({ exif }) => (
    <dl>
        {exif.Make && exif.Model && [<dt>Camera</dt>,<dd>{!exif.Model.startsWith(exif.Make) && exif.Make} {exif.Model}</dd>] }
        {exif.FNumber && [<dt>F-stop</dt>,<dd>f/{exif.FNumber.toString()}</dd>] }
        {exif.ExposureTime && [<dt>Exposure</dt>,<dd>{exif.ExposureTime.numerator}/{exif.ExposureTime.denominator}</dd>] }
        {exif.ISOSpeedRatings && [<dt>ISO speed</dt>,<dd>ISO-{exif.ISOSpeedRatings}</dd>] }
        {exif.DateTime && [<dt>Date</dt>,<dd>{exif.DateTime.replace(/(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3")}</dd>] }
        {exif.PixelXDimension && exif.PixelYDimension && [<dt>Resolution</dt>,<dd>{exif.PixelXDimension}x{exif.PixelYDimension}</dd>] }
    </dl>
);

const Icon = ({ name, ...otherProps }) => (
    <i className="material-icons" {...otherProps}>{name.replace(/ -/, "_")}</i>
);
