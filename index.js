let dates = [];

function pad(s, n) {
  s = '' + s;
  return s.padStart(n, '0');
}

function addPoint(date) {
  dates.push(date);

  let time = `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)} ${pad(date.getHours(), 2)}:${pad(date.getMinutes(), 2)}:${pad(date.getSeconds(), 2)}`;
  let interval = '';
  if(dates.length >= 2) {
    let prevDate = dates[dates.length - 2];
    interval = (date.getTime() - prevDate.getTime()) / 1000.0;
    interval = '' + (Math.trunc(interval * 100) / 100);
  }

  let tableBody = document.getElementById('data').querySelector('tbody');
  let row = document.createElement('tr');
  row.innerHTML = `<td>${time}</td><td>${interval}</td>`;
  tableBody.appendChild(row);

  redraw();
}

let canvasDiv = document.getElementById('viz');
let canvas = canvasDiv.querySelector('canvas');

function redraw() {
  let ctx = canvas.getContext('2d');
  let w = canvas.width;
  let h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  if(dates.length < 3) {
    return;
  }

  // Prepare X axis
  let mapX;
  {
    let start = dates[0].getTime();
    let end = dates[dates.length - 1].getTime();
    // 30 + (x - start) * (w - 30) / (end - start)
    const a = (w - 30) / (end - start);
    const b = 30 - start * (w - 30) / (end - start);
    mapX = (x) => a * x + b;
  }

  // Prepare Y axis
  let mapY;
  let max = dates[1].getTime() - dates[0].getTime();
  for(let i = 1; i < dates.length - 1; ++i) {
    let interval = dates[i + 1].getTime() - dates[i].getTime();
    if(interval > max) {
      max = interval;
    }
  }
  {
    const a = -h / max;
    const b = h;
    mapY = (y) => a * y + b;
  }

  // Draw X axis
  ctx.beginPath();
  ctx.moveTo(30, h - 1);
  ctx.lineTo(w - 1, h - 1);
  ctx.stroke();

  // Draw Y axis
  ctx.beginPath();
  ctx.moveTo(30, h - 1);
  ctx.lineTo(30, 0);
  ctx.stroke();
  {
    let tick = Math.pow(10, Math.floor(Math.log(max) / Math.log(10) - 0.6));
    if(max / tick > 8) {
      tick *= 2;
    }
    for(let y = 0; y <= max; y += tick) {
      ctx.beginPath();
      ctx.moveTo(20, mapY(y));
      ctx.lineTo(35, mapY(y));
      ctx.stroke();

      ctx.fillText('' + (Math.floor(y / 10) / 100), 0, mapY(y));
    }
  }

  // Plot
  function cross(x, y) {
    ctx.moveTo(
      mapX(x) - 10,
      mapY(y),
    );
    ctx.lineTo(
      mapX(x) + 10,
      mapY(y),
    );
    ctx.moveTo(
      mapX(x),
      mapY(y) - 10,
    );
    ctx.lineTo(
      mapX(x),
      mapY(y) + 10,
    );
  }
  ctx.beginPath();
  for(let i = 1; i < dates.length - 1; ++i) {
    let interval1 = dates[i].getTime() - dates[i - 1].getTime();
    let interval2 = dates[i + 1].getTime() - dates[i].getTime();
    ctx.moveTo(
      mapX(dates[i].getTime()),
      mapY(interval1),
    );
    ctx.lineTo(
      mapX(dates[i + 1].getTime()),
      mapY(interval2),
    );

    cross(dates[i].getTime(), interval1);
  }
  cross(
    dates[dates.length - 1].getTime(),
    dates[dates.length - 1].getTime() - dates[dates.length - 2].getTime(),
  );
  ctx.stroke();
}

function resize() {
  canvas.width = canvasDiv.clientWidth;
  canvas.height = canvasDiv.clientHeight;
  redraw();
}
window.addEventListener('resize', resize);
resize();

// Setup button
{
  let button = document.getElementById('tap');
    button.addEventListener('click', (e) => {
    e.preventDefault();

    addPoint(new Date());
  });

  button.innerText = "Tap here";
  button.removeAttribute('disabled');
}
