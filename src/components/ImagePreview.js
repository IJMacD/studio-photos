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

    }

    componentWillReceiveProps(nextProps) {
        if (this.props.image !== nextProps.image) {
            getExifData(nextProps.image.full).then(exif => this.setState({ exif }));
        }
    }

    componentDidMount() {
        getExifData(this.props.image.full).then(exif => this.setState({ exif }));
    }

    render () {
        const image = this.props.image;
        const srcFull = image.full;
        const exif = this.state.exif;
        const filename = image.name;
        const foldername = path.dirname(image.key);

        return (
            <div className={styles.shade} onClick={this.props.onClose}>
                <img className={styles.image} src={srcFull} />
                <div className={styles.metabox} onClick={e => e.stopPropagation()}>
                    <dl>
                        <dt>Name</dt><dd>{filename}</dd>
                        <dt>Folder</dt><dd>{foldername}</dd>
                    </dl>
                    {exif && <EXIFData exif={exif} /> }
                    <a href={srcFull} download={filename} target="_blank">
                        <Icon name="file_download" style={{color: 'white'}} title="Download" />
                    </a>
                </div>
            </div>
        );
    }
}

const EXIFData = ({ exif }) => (
    <dl>
        {exif.DateTime && [<dt>Date</dt>,<dd>{exif.DateTime.replace(/(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3")}</dd>] }
        {exif.PixelXDimension && exif.PixelYDimension && [<dt>Resolution</dt>,<dd>{exif.PixelXDimension}x{exif.PixelYDimension}</dd>] }
        {exif.Make && exif.Model && [<dt>Camera</dt>,<dd>{!exif.Model.startsWith(exif.Make) && trim(exif.Make)} {trim(exif.Model)}</dd>] }
        {exif.FNumber && [<dt>F-stop</dt>,<dd>f/{exif.FNumber.toString()}</dd>] }
        {exif.ExposureTime && [<dt>Exposure</dt>,<dd>1/{Math.round(exif.ExposureTime.denominator/exif.ExposureTime.numerator)}s</dd>] }
        {exif.ISOSpeedRatings && [<dt>ISO speed</dt>,<dd>ISO-{exif.ISOSpeedRatings}</dd>] }
        {exif.Flash && [<dt>Flash</dt>,<dd>{exif.Flash}</dd>] }
        {exif.GPSLatitude && [<dt>Location</dt>,<dd>{formatCoords(exif.GPSLatitude)} {exif.GPSLatitudeRef}<br/>{formatCoords(exif.GPSLongitude)} {exif.GPSLongitudeRef}</dd>] }
    </dl>
);

function formatCoords(coord) {
    return `${coord[0]}° ${coord[1]}′ ${coord[2]}″`;
}

const Icon = ({ name, ...otherProps }) => (
    <i className="material-icons" {...otherProps}>{name.replace(/ -/, "_")}</i>
);

function trim (s) {
    return String(s).replace(/\0/g, "").trim();
}

function getExifData(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => EXIF.getData(img, () => resolve(EXIF.getAllTags(img)));
        img.onerror = reject;
        img.src = url;
    });
}
