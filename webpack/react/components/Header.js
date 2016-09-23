var React = require('react');
var classnames = require('classnames');

var Header = React.createClass({
    displayName: 'Header',

    handleUpload: function (event) {
        var files = this.refs.file.files;
        console.log('file input:', this.refs.file);
        this.props.uploadFiles(files);
    },
    render: function () {
        var { dir, viewing } = this.props;
        var dir_len = dir.path.length;
        var viewing_root = dir.path.length === 1;
        var dir_info_class = classnames('row', {
            'active': viewing.dir
        });
        var dir_size = 0;
        var file_count = 0;
        var dir_count = 0;
        for (var item of dir.contents) {
            dir_size += item.size;
            file_count += item.type === 'file' ? 1 : 0;
            dir_count += item.type === 'dir' ? 1 : 0;
        }
        var Kb_size = Math.floor(dir_size / 1024);
        var Mb_size = Math.floor(dir_size / 1048576);
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
                        React.createElement('input', { disabled: viewing_root, onClick: () => this.props.requestFolder(dir.path[dir_len - 2]), type: 'button', value: 'Back' })
                    ),
                    React.createElement(
                        'li',
                        null,
                        'directory: ',
                        dir.path[dir_len - 1]
                    )
                )
            ),
            React.createElement(
                'section',
                { className: 'col-6' },
                React.createElement(
                    'form',
                    null,
                    React.createElement('input', { type: 'file', ref: 'file' }),
                    React.createElement('input', { type: 'button', onClick: this.handleUpload, value: 'upload' })
                )
            ),
            React.createElement(
                'section',
                { id: 'dir-info', className: dir_info_class },
                React.createElement(
                    'ul',
                    { className: 'horizontal' },
                    React.createElement(
                        'li',
                        null,
                        'size: ',
                        Mb_size,
                        'MiB, ',
                        Kb_size,
                        'KiB'
                    ),
                    React.createElement(
                        'li',
                        null,
                        'files: ',
                        file_count
                    ),
                    React.createElement(
                        'li',
                        null,
                        'folders: ',
                        dir_count
                    )
                )
            )
        );
    }
});

module.exports = Header;