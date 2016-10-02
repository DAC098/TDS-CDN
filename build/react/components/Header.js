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
    handleChange: function(key) {
        switch (key) {
            case 'dir':
                this.props.setUploadState(key,this.refs[key].value);
                break;
            case 'files':
                let files = this.refs[key].files;
                console.log('files:',files);
                this.props.setUploadState(key,files);
                break;
            default:

        }
    },
    render: function() {
        var {nav} = this.props;
        let meta = contentData(this.props.info);
        return (
            <header className='grid'>
                <section className='col-6'>
                    <ul className="horizontal">
                        <li><input onClick={() => this.props.fetchDirection('refresh')} type='button' value='refresh' /></li>
                        <li><input disabled={nav.path.length === 0} onClick={() => this.props.fetchDirection('previous')} type='button' value='Back' /></li>
                        <li>directory: {joinPath(nav.path)}</li>
                    </ul>
                </section>
                <section className='col-6'>
                    <form>
                        <input type='file' ref='files' multiple onChange={() => this.handleChange('files')} />
                        <input type='button' onClick={() => this.props.uploadFiles()} value='upload'/>
                    </form>
                    <form>
                        <input type='text' ref='dir' onChange={() => this.handleChange('dir')} value={this.props.upload.dir} />
                        <input type='button' onClick={() => this.props.uploadDir()} value='create'/>
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
