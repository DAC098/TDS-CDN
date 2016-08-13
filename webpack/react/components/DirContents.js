var React = require('react');
var { isoDate } = require('../../../lib/misc.js');

var DirContents = React.createClass({
    displayName: 'DirContents',

    renderContents: function () {
        return this.props.dir.contents.map((element, index) => {
            var call = element.type === 'file' ? this.props.requestFile : this.props.requestFolder;
            return React.createElement(
                'tr',
                { key: index, onClick: () => call(element.url) },
                React.createElement(
                    'td',
                    null,
                    element.name
                ),
                React.createElement(
                    'td',
                    null,
                    element.type
                ),
                React.createElement(
                    'td',
                    null,
                    element.size
                ),
                React.createElement(
                    'td',
                    null,
                    isoDate(element.mtime)
                )
            );
        });
    },
    render: function () {
        var { dir } = this.props;
        var dir_length = dir.contents.length;
        var dir_empty = dir_length === 0;
        var dir_size = 0;
        var current_directory = dir.path[dir.path.length - 1];
        var is_root = dir.path.length === 1;
        for (var item of dir.contents) {
            dir_size += item.size;
        }
        return React.createElement(
            'section',
            null,
            React.createElement(
                'p',
                null,
                'current directory: ',
                current_directory
            ),
            React.createElement(
                'p',
                null,
                'size (bytes): ',
                dir_size,
                ', count: ',
                dir_length
            ),
            React.createElement(
                'table',
                null,
                React.createElement(
                    'thead',
                    null,
                    React.createElement(
                        'tr',
                        null,
                        React.createElement(
                            'th',
                            null,
                            'Name'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Type'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Size(bytes)'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Modified'
                        )
                    )
                ),
                React.createElement(
                    'tbody',
                    null,
                    !is_root ? React.createElement(
                        'tr',
                        null,
                        React.createElement(
                            'td',
                            { onClick: () => this.props.requestFolder(dir.path[dir.path.length - 2]) },
                            '..'
                        )
                    ) : null,
                    dir_empty ? null : this.renderContents()
                )
            )
        );
    }
});

module.exports = DirContents;