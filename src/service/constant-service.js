const orderState = {
    0: '已取消',
    11: 'A类',
    12: 'B类',
    13: 'C类',
    21: '已接单',
    22: '开始运输',
    26: '到厂',
    27: '离厂',
    90: '已完成'
};

const transNodeState = {
    1: '开始运输',
    2: '提箱',
    3: '到厂',
    4: '离厂',
    5: '还箱'
};

const containerSize = {
    1: 20,
    2: 40,
    3: 45
};

const containerShape = {
    1: 'GP',
    2: 'HC',
    3: 'HQ',
    4: 'OT',
    5: 'RF',
    6: 'TK',
    7: 'FR',
    8: 'RH'
};

const orderLevel = {
    11: '优单',
    12: '普单'
};

module.exports = {
    getOrderState: (key) => {
        if (orderState.hasOwnProperty(key)) {
            return orderState[key];
        } else {
            return '';
        }
    },
    getTransNoteState: (key) => {
        if (transNodeState.hasOwnProperty(key)) {
            return transNodeState[key];
        } else {
            return '';
        }
    },
    getContainerSize(key) {
        if (containerSize.hasOwnProperty(key)) {
            return containerSize[key];
        } else {
            return '';
        }
    },
    getContainerShape(key) {
        if (containerShape.hasOwnProperty(key)) {
            return containerShape[key];
        } else {
            return '';
        }
    },
    getOrderLevel(key) {
        if (orderLevel.hasOwnProperty(key)) {
            return orderLevel[key];
        } else {
            return '普单';
        }
    }
};
