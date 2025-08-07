// ---------------- CLASS DRAGOBJECT ----------------
class DragObject {
    constructor(x, y, name = '', image = '', rotation = 0) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.image = image;
        this.rotation = rotation;
        this.id = '_' + Date.now() + Math.random().toString(36).substring(2, 9);
    }

    render() {
        return $(`
            <div class="table-item" data-id="${this.id}" 
              style="transform: translate(${this.x}px, ${this.y}px)">
              <div class="box-image" style="transform:rotate(${this.rotation}deg);">
                <img src="${this.image}" class="img-fluid" style="max-width:100%; max-height:100%;">
              </div>
              <div class="text-center fw-bold small box-name">${this.name || ''}</div>
              <div class="table-controls">
                <button class="btn btn-sm btn-rotate ">
                    <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"/>
                    </svg>
                </button>
                <button class="btn btn-sm btn-edit ${!this.isEdit ? 'd-none' : ''}">
                    <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13v-2a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L14 4.757V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L4.929 6.343a1 1 0 0 0 0 1.414l.536.536L4.757 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535 1.707.707V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H20a1 1 0 0 0 1-1Z"/>
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                    </svg>
                </button>
                <button class="btn btn-sm btn-delete">
                    <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
                    </svg>
                </button>
              </div>
            </div>
        `);
    }
}
//---------------- CLASS TABLE ----------------
class Table extends DragObject {
    constructor(x, y, name = '', seats = 2, shape = 'square') {
        super(x, y, name);
        this.seats = seats;
        this.shape = shape;
        this.isEdit = true;
        this.image = `images/${shape}_${seats}.png`;
    }
}

//---------------- CLASS DOOR ----------------
class Door extends DragObject {
    constructor(x, y, name = '') {
        super(x, y, name);
        this.image = '/images/door.png';
        this.isEdit = false;
    }
}

// ---------------- CLASS TABLE AREA ----------------
class TableArea {
    constructor(container) {
        this.container = $(container);
        this.items = [];
        this.tempNewTable = null;
        this.snapToGrid = false;
        this.gridSize = 100;
    }

    setSize(width, height, skipRender = false) {
        this.container.css({ width, height });
        const w = this.container.outerWidth();
        const h = this.container.outerHeight();
        this.items.forEach(t => {
            if (t.x + 100 > w) t.x = w - 100;
            if (t.y + 100 > h) t.y = h - 100;
        });
        if (!skipRender) this.render();
        const heightInput = $('#input-height');
        if (heightInput) heightInput.val(h);
    }

    loadItems(itemList) {
        this.items = itemList.map(obj => {
            switch (obj.type) {
                case 'table':
                    return Object.assign(new Table(obj.x, obj.y, obj.name, obj.seats, obj.shape), obj);
                case 'door':
                    return Object.assign(new Door(obj.x, obj.y, obj.name), obj);
                default:
                    return Object.assign(new DragObject(obj.x, obj.y, obj.name, obj.image, obj.rotation), obj);
            }
        }

        );
        this.render();
    }

    addTable() {
        const deltaY = 100;
        if (this.items.length === 0) {
            this.tempNewTable = new Table(20, 20);
        } else {
            const maxY = Math.max(...this.items.map(t => t.y));
            this.tempNewTable = new Table(20, maxY + deltaY);
            if (maxY + deltaY >= this.container.outerHeight() - deltaY) {
                this.setSize(this.container.outerWidth(), this.container.outerHeight() + deltaY, true)
            }
        }

        this.tempNewTable.name = "";
        this.tempNewTable.seats = 2;
        this.tempNewTable.shape = 'square';
        this.tempNewTable.image = `images/square_2.png`
        openEditModal(this.tempNewTable);
    }

    deleteItem(id) {
        this.items = this.items.filter(t => t.id !== id);
        this.render();
    }

    getItem(id) {
        return this.items.find(t => t.id === id);
    }

    render() {
        this.container.empty();
        this.items.forEach(item => {
            const $el = item.render();
            this.container.append($el);
            this.makeDraggable($el, item);
        });
    }

    makeDraggable($el, item) {
        let isDragging = false, offsetX = 0, offsetY = 0;

        $el.on('mousedown', function (e) {
            if ($(e.target).is('button')) return;
            isDragging = true;
            offsetX = e.pageX - item.x;
            offsetY = e.pageY - item.y;
        });

        $(document).on('mousemove', (e) => {
            if (!isDragging) return;
            item.x = e.pageX - offsetX;
            item.y = e.pageY - offsetY;

            if (item.x < 10) item.x = 0;
            if (item.x > this.container.outerWidth() - ($el.outerWidth())) item.x = this.container.outerWidth() - ($el.outerWidth());
            if (item.y < 10) item.y = 0;

            if (this.snapToGrid) {
                item.x = Math.round(item.x / this.gridSize) * this.gridSize;
                item.y = Math.round(item.y / this.gridSize) * this.gridSize;
                if (item.x + this.gridSize > this.container.outerWidth()) {
                    item.x = (Math.round(item.x / this.gridSize) * this.gridSize) - this.gridSize;
                }
            }
            const itemBottom = item.y + $el.outerHeight();
            if (itemBottom > this.container.outerHeight() - 50) {
                this.setSize(this.container.outerWidth(), itemBottom + 100, true);
            }
            $el.css('transform', `translate(${item.x}px, ${item.y}px)`);
        }).on('mouseup', function () {
            isDragging = false;
        });

        const $rotateBtn = $el.find('.btn-rotate');
        let rotating = false, centerX, centerY, startAngle;

        $rotateBtn.on('mousedown', function (e) {
            e.stopPropagation();
            rotating = true;
            const offset = $el.offset();
            centerX = offset.left + $el.width() / 2;
            centerY = offset.top + $el.height() / 2;
            startAngle = Math.atan2(e.pageY - centerY, e.pageX - centerX) * (180 / Math.PI) - item.rotation;
        });

        $(document).on('mousemove.rotate', function (e) {
            if (!rotating) return;
            const currentAngle = Math.atan2(e.pageY - centerY, e.pageX - centerX) * (180 / Math.PI);
            item.rotation = currentAngle - startAngle;
            $el.find('.box-image').css('transform', `rotate(${item.rotation}deg)`);
        }).on('mouseup.rotate', function () {
            rotating = false;
        });

        $el.find('.btn-delete').click(() => this.deleteItem(item.id));
        $el.find('.btn-edit').click(() => openEditModal(item, 'edit'));

        $el.on('click', (e) => {
            e.stopPropagation();
            $('.table-item').removeClass('selected');
            $el.addClass('selected');
        });

    }
}


