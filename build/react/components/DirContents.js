var React = require('react');
var {isoDate} = require('../../../lib/misc.js');
var classnames = require('classnames');

var DirContents = React.createClass({
    renderContents: function() {
        return this.props.dir.map((element,index) => {
            let item_class = classnames({
                'selected': this.props.selected.has(index)
            });
            return (
                <tr key={index}
                    onClick={() => this.props.selectItem(index,element.url)}
                    onDoubleClick={() => this.props.fetch(element.type,element.url)}
                    className={item_class}
                >
                    <td>{element.name}</td>
                    <td>{element.type}</td>
                    <td>{element.size}</td>
                    <td>{isoDate(element.mtime)}</td>
                </tr>
            );
        });
    },
    render: function() {
        var dir_empty = this.props.dir.length === 0;
        return (
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Size(bytes)</th>
                        <th>Modified</th>
                    </tr>
                </thead>
                <tbody>
                    {dir_empty ?
                        null
                        :
                        this.renderContents()
                    }
                </tbody>
            </table>
        );
    }
});

module.exports = DirContents;
