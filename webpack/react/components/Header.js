var React = require('react');
var classnames = require('classnames');

var { joinPath } = require('../../misc.js');

function contentData(content) {
    let rtn = {
        size: 0,
        files: 0,
        dirs: 0,
        Kb: 0,
        Mb: 0
    };
    if (Array.isArray(content)) {
        for (let item of content) {
            rtn.size += item.size;
            rtn.files += item.type === 'file' ? 1 : 0;
            rtn.dirs += item.type === 'dir' ? 1 : 0;
        }
    } else {
        rtn.size = content.size;
    }
    rtn.KiB = Math.floor(rtn.size / 1024);
    rtn.MiB = Math.floor(rtn.size / 1048576);
    return rtn;
}

var Header = React.createClass({
    displayName: 'Header',

    handleChange: function (key) {
        switch (key) {
            case 'dir':
                this.props.setUploadState(key, this.refs[key].value);
                break;
            case 'files':
                let files = this.refs[key].files;
                console.log('files:', files);
                this.props.setUploadState(key, files);
                break;
            default:

        }
    },
    render: function () {
        var { nav } = this.props;
        let meta = contentData(this.props.info);
        return React.createElement(
            'header',
            { className: 'grid' },
            React.createElement(
                'section',
                { className: 'col-6' },
                React.createElement(
                    'ul',
                    { className: 'horizontal' },
                    React.createElement(
                        'li',
                        null,
                        React.createElement('input', { onClick: () => this.props.fetchDirection('refresh'), type: 'button', value: 'refresh' })
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement('input', { disabled: nav.path.length === 0, onClick: () => this.props.fetchDirection('previous'), type: 'button', value: 'Back' })
                    ),
                    React.createElement(
                        'li',
                        null,
                        'directory: ',
                        joinPath(nav.path)
                    )
                )
            ),
            React.createElement(
                'section',
                { className: 'col-6' },
                React.createElement(
                    'form',
                    null,
                    React.createElement('input', { type: 'file', ref: 'files', multiple: true, onChange: () => this.handleChange('files') }),
                    React.createElement('input', { type: 'button', onClick: () => this.props.uploadFiles(), value: 'upload' })
                ),
                React.createElement(
                    'form',
                    null,
                    React.createElement('input', { type: 'text', ref: 'dir', onChange: () => this.handleChange('dir'), value: this.props.upload.dir }),
                    React.createElement('input', { type: 'button', onClick: () => this.props.uploadDir(), value: 'create' })
                )
            ),
            React.createElement(
                'section',
                { id: 'dir-info', className: 'row' },
                React.createElement(
                    'ul',
                    { className: 'horizontal' },
                    React.createElement(
                        'li',
                        null,
                        'size: ',
                        meta.MiB,
                        'MiB | ',
                        meta.KiB,
                        'KiB'
                    ),
                    nav.type.dir ? React.createElement(
                        'li',
                        null,
                        'files: ',
                        meta.files,
                        ', folders: ',
                        meta.dirs
                    ) : null
                )
            )
        );
    }
});

module.exports = Header;