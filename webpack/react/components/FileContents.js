var React = require('react');
var { isoDate } = require('../../../lib/misc.js');

var FileContents = React.createClass({
    displayName: 'FileContents',

    render: function () {
        var { file, dir } = this.props;
        return React.createElement(
            'section',
            null,
            React.createElement(
                'p',
                null,
                'current_directory: ',
                dir.path[dir.path.length - 1]
            ),
            React.createElement('input', { onClick: () => this.props.requestFolder(dir.path[dir.path.length - 2]), type: 'button', value: 'Back' }),
            React.createElement(
                'a',
                { href: file.download, download: true },
                'Download'
            ),
            React.createElement(
                'ul',
                null,
                React.createElement(
                    'li',
                    null,
                    'name: ',
                    file.name
                ),
                React.createElement(
                    'li',
                    null,
                    'extension: ',
                    file.ext
                ),
                React.createElement(
                    'li',
                    null,
                    'full name: ',
                    file.base
                ),
                React.createElement(
                    'li',
                    null,
                    'size (bytes): ',
                    file.size
                ),
                React.createElement(
                    'li',
                    null,
                    'created: ',
                    isoDate(file.birthtime)
                ),
                React.createElement(
                    'li',
                    null,
                    'modified: ',
                    isoDate(file.mtime)
                )
            )
        );
    }
});

module.exports = FileContents;