ax_num1 = 0
ax_num2 = 0
ax_num3 = 0

function configurarGrafico() {
 
  const labels = [
    '0',

  ];

  const data = {
    labels: labels,
    datasets: [{
      label: 'Seu lucro sem nosso serviço',
      backgroundColor: 'rgb(233, 30, 30)',
      borderColor: 'rgb(233, 30, 30)',
      data: [ax_num2],
    },
    {
      label: 'Seu lucro com nosso serviço',
      backgroundColor: 'rgb(25, 25, 175)',
      borderColor: 'rgb(25, 25, 175)',
      data: [ax_num3],
    }
    ]
  };
  console.log(ax_num3)

  const config = {
    type: 'bar',
    data: data,
    options: {}
  };



  const myChart = new Chart(
    document.getElementById('myChart1'),
    config
    
  );
  
 
}

function atualizarGrafico() {
  myChart1.style.display = 'none';
  myChart2.style.display = 'block';
 
  const labels = [
    '0',

  ];

  const data = {
    labels: labels,
    datasets: [{
      label: 'Seu lucro sem nosso serviço',
      backgroundColor: 'rgb(233, 30, 30)',
      borderColor: 'rgb(233, 30, 30)',
      data: [ax_num2],
    },
    {
      label: 'Seu lucro com nosso serviço',
      backgroundColor: 'rgb(25, 25, 175)',
      borderColor: 'rgb(25, 25, 175)',
      data: [ax_num3],
    }
    ]
  };
  console.log(ax_num3)

  const config = {
    type: 'bar',
    data: data,
    options: {}
  };



  const myChart = new Chart(
    document.getElementById('myChart2'),
    config
    
  );
 
}
function calcular() {

  ax_num1 = Number(ipt_peso.value)
  ax_num2 = Number(ipt_valor.value * 0.50)
  ax_num3 = Number(ipt_valor.value * 0.90)
  ax_inv = Number(ax_num2 - ax_num3)
  ax_real = ax_inv * -1

  mostrar1.innerHTML = `${ax_num1} Kg`
  mostrar2.innerHTML = `R$${ax_real.toFixed(2)}`
  mostrar3.innerHTML = `R$${ax_num3.toFixed(2)}`
  mostrar4.innerHTML = `R$${ax_num2.toFixed(2)}`

  atualizarGrafico()
}
