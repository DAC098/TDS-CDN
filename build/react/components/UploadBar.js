var React = require('react');

var UploadBar = React.createClass({
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
        return (
            <section className='row'>
                <form>
                    <input type='file' ref='files' multiple onChange={() => this.handleChange('files')} />
                    <input type='button' onClick={() => this.props.uploadFiles()} value='upload'/>
                </form>
                <form>
                    <input type='text' ref='dir' onChange={() => this.handleChange('dir')} value={this.props.upload.dir} />
                    <input type='button' onClick={() => this.props.uploadDir()} value='create'/>
                </form>
            </section>
        )
    }
});

module.exports = UploadBar;
