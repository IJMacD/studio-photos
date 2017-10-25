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
        this.img.src = this.props.image.full;
    }
    componentDidMount() {
        this.img.src = this.props.image.full;
    }
    render () {
        const image = this.props.image;
        const srcFull = image.full;
        const exif = this.state.exif;
        const filename = path.basename(decodeURIComponent(srcFull));
        const foldername = path.basename(path.dirname(decodeURIComponent(srcFull)));

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
        {exif.Make && exif.Model && [<dt>Camera</dt>,<dd>{!exif.Model.startsWith(exif.Make) && trim(exif.Make)} {trim(exif.Model)}</dd>] }
        {exif.FNumber && [<dt>F-stop</dt>,<dd>f/{exif.FNumber.toString()}</dd>] }
        {exif.ExposureTime && [<dt>Exposure</dt>,<dd>1/{Math.round(exif.ExposureTime.denominator/exif.ExposureTime.numerator)}s</dd>] }
        {exif.ISOSpeedRatings && [<dt>ISO speed</dt>,<dd>ISO-{exif.ISOSpeedRatings}</dd>] }
        {exif.DateTime && [<dt>Date</dt>,<dd>{exif.DateTime.replace(/(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3")}</dd>] }
        {exif.PixelXDimension && exif.PixelYDimension && [<dt>Resolution</dt>,<dd>{exif.PixelXDimension}x{exif.PixelYDimension}</dd>] }
    </dl>
);

const Icon = ({ name, ...otherProps }) => (
    <i className="material-icons" {...otherProps}>{name.replace(/ -/, "_")}</i>
);

function trim (s) {
    return String(s).replace(/\0/g, "").trim();
}
