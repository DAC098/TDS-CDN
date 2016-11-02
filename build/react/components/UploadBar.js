var React = require('react');

var self = null;

var UploadBar = React.createClass({
    componentDidMount: function() {
        self = this;
    },
    statics: {
        clearFiles: function() {
            console.log('clearing files');
            self.refs['file'].value = '';
        }
    },
    handleChange: function(key) {
        switch (key) {
            case 'dir':
                this.props.setUploadState(key,this.refs[key].value);
                break;
            case 'file':
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
                    <input type='file' ref='file' multiple
                        onChange={() => this.handleChange('file')}
                    />
                    <input type='button' className='small'
                        onClick={() => this.props.uploadFiles()}
                        value='upload'
                    />
                </form>
                <form>
                    <input type='text' ref='dir'
                        className='inline'
                        onChange={() => this.handleChange('dir')}
                        value={this.props.upload.dir}
                    />
                    <input type='button' className='small'
                        onClick={() => this.props.uploadDir()}
                        value='create'
                    />
                </form>
            </section>
        );
    }
});

module.exports = UploadBar;
