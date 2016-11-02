var React = require('react');

function contentData(content) {
    let rtn = {
        size: 0,
        files: 0,
        dirs: 0,
        Kb: 0,
        Mb: 0
    };
    if(Array.isArray(content)) {
        for(let item of content) {
            rtn.size += item.size;
            rtn.files += (item.type === 'file') ? 1 : 0;
            rtn.dirs += (item.type === 'dir') ? 1 : 0;
        }
    } else {
        rtn.size = content.size;
    }
    rtn.KiB = Math.floor(rtn.size / 1024);
    rtn.MiB = Math.floor(rtn.size / 1048576);
    return rtn;
}

var ItemInfo = React.createClass({
    render: function() {
        let {nav} = this.props;
        let meta = contentData(this.props.info);
        return (
            <section id='dir-info' className='row'>
                <ul className='horizontal'>
                    <li>size: {meta.MiB}MiB | {meta.KiB}KiB</li>
                    { nav.type.dir ?
                        <li>files: {meta.files}, folders: {meta.dirs}</li>
                        :
                        null
                    }
                </ul>
            </section>
        );
    }
});

module.exports = ItemInfo;
