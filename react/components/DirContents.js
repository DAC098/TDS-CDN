var React = require('react');
var {isoDate} = require('../../../lib/misc.js');

var DirContents = React.createClass({
    renderContents: function() {
        return this.props.dir.contents.map((element,index) => {
            var call = (element.type === 'file') ? this.props.requestFile : this.props.requestFolder;
            return (
                <tr key={index} onClick={() => call(element.url)}>
                    <td>{element.name}</td>
                    <td>{element.type}</td>
                    <td>{element.size}</td>
                    <td>{isoDate(element.mtime)}</td>
                </tr>
            )
        })
    },
    render: function() {
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
                    <tr><td onClick={() => this.props.requestFolder(this.props.dir.parent)}>..</td></tr>
                    {this.renderContents()}
                </tbody>
            </table>
        )
    }
});

module.exports = DirContents;
