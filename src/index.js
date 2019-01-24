import echarts from 'echarts';
import { getData, getMetricTooltip, setShapeOption } from './utils';

import './index.css';

/**
 * Global controller object is described on Zoomdata knowledge base
 * @see https://www.zoomdata.com/developers/docs/custom-chart-api/controller/
 */

/* global controller */

/**
 * @see http://www.zoomdata.com/developers/docs/custom-chart-api/creating-chart-container/
 */
const chartContainer = document.createElement('div');
chartContainer.classList.add('chart-container');
controller.element.appendChild(chartContainer);

echarts.registerPostUpdate(() => {
    const virtualPadding = 10;
    const zrenderStorage = pie._zr.storage;
    // Get list of shapes
    zrenderStorage.updateDisplayList();
    zrenderStorage._displayList.map(shape => {
        if (shape.type === 'text') {
            const labelBoundingRect = shape.getBoundingRect();
            const line = _.find(zrenderStorage._displayList, figure => figure.type === 'polyline' && shape.dataIndex === figure.dataIndex);
            if ((labelBoundingRect.x + labelBoundingRect.width + virtualPadding) > pie._zr.getWidth() || labelBoundingRect.x < virtualPadding || 
                (labelBoundingRect.y + labelBoundingRect.height + virtualPadding) > pie._zr.getHeight() || labelBoundingRect.y < virtualPadding) {
                shape.invisible = line.invisible = true;
            } else {
                shape.invisible = line.invisible = false;
            }
        }
    });
});

const pie = echarts.init(chartContainer);
const option = {
    series: [
        {
            type:'pie',
            radius: '50%',
            hoverOffset: 3,
            label: {
                color: '#000',
                fontSize: 14,
                fontFamily:'Source Pro, source-sans-pro, Helvetica, Arial, sans-serif',
                formatter: params => `${params.name} | ${controller.dataAccessors['Size'].format(params.value)} (${params.percent}%)`,
            },
            data: [],
        }
    ]
};

/**
 * @see http://www.zoomdata.com/developers/docs/custom-chart-api/updating-queries-axis-labels/
 */
controller.createAxisLabel({
    picks: 'Group By',
    orientation: 'horizontal',
    position: 'bottom',
    popoverTitle: 'Group'
});

controller.createAxisLabel({
    picks: 'Size',
    orientation: 'horizontal',
    position: 'bottom'
});

/**
 * @see http://www.zoomdata.com/developers/docs/custom-chart-api/receiving-chart-data/
 */
controller.update = data => {
    const dataUpdate = getData(data);
    option.series[0].data = dataUpdate;
    pie.setOption(option);
};

controller.resize = () => pie.resize();

// Tooltip
pie.on('mousemove', params => {
    if (_.has(params, 'data.datum') && _.isObject(params.data.datum)) {
        controller.tooltip.show({
            x: params.event.event.clientX,
            y: params.event.event.clientY,
            content: () => {
                return getMetricTooltip(params);
            }
        });
    }
});

pie.on('mouseout', () => {
    controller.tooltip.hide();
});

// Menu bar
pie.on('click', params => {
    if (_.has(params, 'data.datum') && _.isObject(params.data.datum)) {
        controller.tooltip.hide();
        controller.menu.show({
            x: params.event.event.clientX,
            y: params.event.event.clientY,
            data: () => params.data.datum,
        });
    }
});
