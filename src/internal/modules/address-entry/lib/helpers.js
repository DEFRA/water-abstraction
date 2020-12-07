const getAddressText = address => {
  const { addressLine1, addressLine2, addressLine3, addressLine4 } = address;
  const addressLines = compact([addressLine1, addressLine2, addressLine3, addressLine4])
    .map(line => titleCase(line))
    .join(' ');
  return `${addressLines}, ${titleCase(address.town)}, ${address.postcode}`;
};
