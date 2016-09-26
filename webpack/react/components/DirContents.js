var React = require('react');
var { isoDate } = require('../../../lib/misc.js');

var DirContents = React.createClass({
    displayName: 'DirContents',

    renderContents: function () {
        return this.props.dir.map((element, index) => {
            return React.createElement(
                'tr',
                { key: index, onClick: () => this.props.request('forward', element.type, element.name) },
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
        var dir_empty = this.props.dir.length === 0;
        return React.createElement(
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
                dir_empty ? null : this.renderContents()
            )
        );
    }
});

module.exports = DirContents;