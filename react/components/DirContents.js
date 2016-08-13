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
        var {dir} = this.props;
        var dir_length = dir.contents.length;
        var dir_empty = dir_length === 0;
        var dir_size = 0;
        var current_directory = dir.path[dir.path.length - 1];
        var is_root = dir.path.length === 1;
        for(var item of dir.contents) {
            dir_size += item.size;
        }
        return (
            <section>
                <p>current directory: {current_directory}</p>
                <p>size (bytes): {dir_size}, count: {dir_length}</p>
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
                        {!is_root ?
                            <tr><td onClick={() => this.props.requestFolder(dir.path[dir.path.length - 2])}>..</td></tr>
                            :
                            null
                        }
                        {dir_empty ?
                            null
                            :
                            this.renderContents()
                        }
                    </tbody>
                </table>
            </section>
        )
    }
});

module.exports = DirContents;
