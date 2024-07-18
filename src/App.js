import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './App.css';

function App() {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState({ name: '', amount: '' });
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customerResponse = await axios.get('http://localhost:5000/customers');
        const transactionResponse = await axios.get('http://localhost:5000/transactions');

        const customersData = customerResponse.data;
        const transactionsData = transactionResponse.data.map(transaction => {
          const customer = customersData.find(c => c.id == transaction.customer_id);
          return {
            ...transaction,
            customerName: customer ? customer.name : 'Unknown'
          };
        });

        setCustomers(customersData);
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const handleCustomerSelect = (e) => {
    setSelectedCustomer(parseInt(e.target.value, 10));
  };

  const filteredTransactions = transactions.filter(transaction => {
    
    return (
      transaction.customerName.toLowerCase().includes(filter.name.toLowerCase()) &&
      transaction.amount >= (filter.amount ? parseFloat(filter.amount) : 0)
    );
  });

  const transactionsByCustomer = selectedCustomer
    ? transactions.filter(t => t.customer_id === selectedCustomer)
    : [];

  const transactionAmountsByDate = transactionsByCustomer.reduce((acc, curr) => {
    acc[curr.date] = (acc[curr.date] || 0) + curr.amount;
    return acc;
  }, {});

  const graphData = {
    labels: Object.keys(transactionAmountsByDate),
    datasets: [
      {
        label: 'Total Transaction Amount',
        data: Object.values(transactionAmountsByDate),
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: false
      }
    ]
  };

  return (
    <div className="App">
      <h2 className="py-3">Customer Transactions</h2>
      <div className="filter-section mb-3 fs-6 fw-bold">
        <label className="p-2">
          Filter by Customer Name:
          <input type="text" name="name" value={filter.name} onChange={handleFilterChange} />
        </label>
        <label className="p-2">
          Filter by Transaction Amount (greater than):
          <input type="number" name="amount" value={filter.amount} onChange={handleFilterChange} />
        </label>
      </div>
      <div className="container mb-3">
        <table className="table table-bordered border-dark table-striped table-hover">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Customer Name</th>
              <th>Transaction ID</th>
              <th>Transaction Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(transaction => (
              <tr key={transaction.id}>
                <td>{transaction.customer_id}</td>
                <td>{transaction.customerName}</td>
                <td>{transaction.id}</td>
                <td>{transaction.date}</td>
                <td>{transaction.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="select-customer fs-6 fw-bold mb-3">
        <label>
          Select Customer:
          <select onChange={handleCustomerSelect}>
            <option value="">Select</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>
        </label>
      </div>
      {selectedCustomer && (
        <div className="container mb-5">
          <div className="graph">
            <Line data={graphData} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
