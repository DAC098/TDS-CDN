var React = require('react');
var {isoDate} = require('../../../lib/misc.js');

var FileContents = React.createClass({
    render: function() {
        var {file} = this.props;
        return (
            <section>
                <section>
                    <a href={file.download} download>Download</a>
                    <input type='button' onClick={() => this.props.removeFile()} value='delete'/>
                </section>
                <ul>
                    <li>name: {file.name}</li>
                    <li>extension: {file.ext}</li>
                    <li>full name: {file.base}</li>
                    <li>size (bytes): {file.size}</li>
                    <li>created: {isoDate(file.birthtime)}</li>
                    <li>modified: {isoDate(file.mtime)}</li>
                </ul>
            </section>
        );
    }
});

module.exports = FileContents;
