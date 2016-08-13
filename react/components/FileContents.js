var React = require('react');
var {isoDate} = require('../../../lib/misc.js');

var FileContents = React.createClass({
    render: function() {
        var {file,dir} = this.props;
        return (
            <section>
                <p>current_directory: {dir.path[dir.path.length - 1]}</p>
                <input onClick={() => this.props.requestFolder(dir.path[dir.path.length - 2])} type="button" value="Back" />
                <a href={file.download} download>Download</a>
                <ul>
                    <li>name: {file.name}</li>
                    <li>extension: {file.ext}</li>
                    <li>full name: {file.base}</li>
                    <li>size (bytes): {file.size}</li>
                    <li>created: {isoDate(file.birthtime)}</li>
                    <li>modified: {isoDate(file.mtime)}</li>
                </ul>
            </section>
        )
    }
});

module.exports = FileContents;
