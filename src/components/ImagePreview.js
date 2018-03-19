import React from 'react';
import EXIF from 'exif-js';
import path from 'path';

import Loading from './Loading';

import styles from './ImagePreview.css';

/**
 * @typedef Item
 * @prop {string} key
 * @prop {string} thumb
 * @prop {string} full
 * @prop {string} name
 */

/**
 * @typedef ImagePreviewProps
 * @prop {Item} image
 * @prop {() => void} onClose
 */

/**
 * @typedef ImagePreviewState
 * @prop {any} exif
 */

 /** @augments React.Component<ImagePreviewProps, ImagePreviewState> */
export default class ImagePreview extends React.Component {

    /**
     *
     * @param {ImagePreviewProps} props
     */
    constructor (props) {
        super(props);

        /** @type {ImagePreviewState} */
        this.state = {
            exif: null,
        };

        this.handleEXIFLoad = this.handleEXIFLoad.bind(this);
    }

    handleEXIFLoad ({ url, exif }) {
        if (url === this.props.image.full) {
            // Only update state if url matches current props
            this.setState({ exif });
        }
    }

    /**
     * @param {ImagePreviewProps} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.image !== nextProps.image) {
            this.setState({ exif: null }); // Make sure EXIF data is blanked between images

            getExifData(nextProps.image.full).then(this.handleEXIFLoad);
        }
    }

    componentDidMount() {
        getExifData(this.props.image.full).then(this.handleEXIFLoad);
    }

    render () {
        const image = this.props.image;
        const srcFull = image.full;
        const exif = this.state.exif;
        const filename = image.name;
        const foldername = path.dirname(image.key);

        return (
            <div className={styles.shade} onClick={this.props.onClose}>
                <a href={srcFull} target="_blank" onClick={e => {e.preventDefault(); this.props.onClose()}}>
                    <ImageLoader className={styles.image} src={srcFull} />
                </a>
                <div className={styles.metabox} onClick={e => e.stopPropagation()}>
                    <dl>
                        <dt>Name</dt><dd>{filename}</dd>
                        <dt>Folder</dt><dd><a href={"#q="+encodeURIComponent(foldername)} onClick={this.props.onClose}>{foldername}</a></dd>
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
        {exif.DateTime && <React.Fragment><dt>Date</dt><dd>{exif.DateTime.replace(/(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3")}</dd></React.Fragment> }
        {exif.PixelXDimension && exif.PixelYDimension && <React.Fragment><dt>Resolution</dt><dd>{exif.PixelXDimension}x{exif.PixelYDimension}</dd></React.Fragment> }
        {exif.Make && exif.Model && <React.Fragment><dt>Camera</dt><dd>{!exif.Model.startsWith(exif.Make) && trim(exif.Make)} {trim(exif.Model)}</dd></React.Fragment> }
        {exif.FNumber && <React.Fragment><dt>F-stop</dt><dd>f/{exif.FNumber.toString()}</dd></React.Fragment> }
        {exif.ExposureTime && <React.Fragment><dt>Exposure</dt><dd>1/{Math.round(exif.ExposureTime.denominator/exif.ExposureTime.numerator)}s</dd></React.Fragment> }
        {exif.ISOSpeedRatings && <React.Fragment><dt>ISO speed</dt><dd>ISO-{exif.ISOSpeedRatings}</dd></React.Fragment> }
        {exif.Flash && <React.Fragment><dt>Flash</dt><dd>{exif.Flash}</dd></React.Fragment> }
        {exif.GPSLatitude && <React.Fragment><dt>Location</dt><dd>{formatCoords(exif.GPSLatitude)} {exif.GPSLatitudeRef}<br/>{formatCoords(exif.GPSLongitude)} {exif.GPSLongitudeRef}</dd></React.Fragment> }
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
        img.onload = () => EXIF.getData(img, () => resolve({ url, exif: EXIF.getAllTags(img) }));
        img.onerror = reject;
        img.src = url;
    });
}

class ImageLoader extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            loaded: false,
            error: false,
            showSpinner: false,
        };
    }

    loadImage (src) {
        this.setState({ loaded: false, showSpinner: false });

        // Only show spinner if image is taking a long time to load (more than 0.5s)
        this.spinnerTimeout = setTimeout(() => this.setState({ showSpinner: true}), 500);

        if (this.ref) {
            const img = this.ref;
            img.onload = () => this.setState({ loaded: true });
            img.onerror = () => this.setState({ error: true });
        }
    }

    componentDidMount () {
        this.loadImage();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.src !== this.props.src) {
            this.loadImage();
        }
    }

    componentWillUnmount () {
        clearTimeout(this.spinnerTimeout);
    }

    render () {
        const { loaded, showSpinner } = this.state;
        return <React.Fragment>
            { !loaded && <Loading spinner style={{ opacity: showSpinner ? 1 : 0, transition: "1s all" }} /> } }
            <img {...this.props} ref={r => this.ref = r} style={{ opacity: loaded ? 1 : 0, transition: "0.5s all" }} />
        </React.Fragment>;
    }
}
