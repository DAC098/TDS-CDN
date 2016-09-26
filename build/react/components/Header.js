var React = require('react');
var classnames = require('classnames');

var {joinPath} = require('../../misc.js');

function contentData(content) {
    let rtn = {
        size: 0,
        files: 0,
        dirs: 0,
        Kb: 0,
        Mb: 0
    }
    if(Array.isArray(content)) {
        for(let item of content) {
            rtn.size += item.size;
            rtn.files += (item.type === 'file') ? 1 : 0;
            rtn.dirs += (item.type === 'dir') ? 1 : 0;
        }
    } else {
        rtn.size = content.size;
    }
    rtn.KiB = Math.floor(rtn.size / 1024);
    rtn.MiB = Math.floor(rtn.size / 1048576);
    return rtn;
}

var Header = React.createClass({
    handleUpload: function(event) {
        var files = this.refs.file.files;
        //console.log('file input:',this.refs.file);
        this.props.uploadFiles(files);
    },
    render: function() {
        var {nav} = this.props;
        let meta = contentData(this.props.info);
        return (
            <header className='grid'>
                <section className='col-6'>
                    <ul className="horizontal">
                        <li><input disabled={nav.path.length === 0} onClick={() => this.props.request('back','dir')} type='button' value='Back' /></li>
                        <li>directory: {joinPath(nav.path)}</li>
                    </ul>
                </section>
                <section className='col-6'>
                    <form>
                        <input type='file' ref='file' />
                        <input type='button' onClick={this.handleUpload} value='upload' />
                    </form>
                </section>
                <section id='dir-info' className='row'>
                    <ul className="horizontal">
                        <li>size: {meta.MiB}MiB | {meta.KiB}KiB</li>
                        { nav.type.dir ?
                            <li>files: {meta.files}, folders: {meta.dirs}</li>
                            :
                            null
                        }
                    </ul>
                </section>
            </header>
        )
    }
});

module.exports = Header;
