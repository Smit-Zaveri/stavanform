export const useCSVOperations = (collectionName, collections) => {
  const exportToCSV = () => {
    const csvHeaders = ["Name", "Display Name", "Order Number", "Picture URL"];
    const csvRows = collections.map(
      ({ name, displayName, numbering, picture }) => [
        name,
        displayName,
        numbering,
        picture,
      ]
    );

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${collectionName}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSVData = (text) => {
    const csvRows = text.split("\n");
    const headers = csvRows[0]
      ?.split(",")
      ?.map((header) => header.replace(/"/g, "").trim());

    const nameIndex = headers.indexOf("Name");
    const displayNameIndex = headers.indexOf("Display Name");
    const numberingIndex = headers.indexOf("Order Number");
    const pictureIndex = headers.indexOf("Picture URL");

    if (nameIndex === -1 || displayNameIndex === -1 || numberingIndex === -1) {
      throw new Error(
        "CSV must have Name, Display Name, and Order Number columns. Picture URL is optional."
      );
    }

    const existingNames = collections.map((collection) =>
      collection.name.toLowerCase()
    );
    const newCollectionNames = new Set();

    return csvRows
      .slice(1)
      .map((row) => {
        const values = row?.split(",").map((value) => value.replace(/^"?|"$/g, ""));
        if (values.length < headers.length) return null;

        const item = {
          name: values[nameIndex]?.trim(),
          displayName: values[displayNameIndex]?.trim(),
          numbering: parseFloat(values[numberingIndex]?.trim()),
          picture: pictureIndex !== -1 ? values[pictureIndex]?.trim() : "",
        };

        if (!item.name || !item.displayName || isNaN(item.numbering)) return null;

        const normalizedName = item.name.toLowerCase();
        if (
          existingNames.includes(normalizedName) ||
          newCollectionNames.has(normalizedName)
        ) {
          return null;
        }

        newCollectionNames.add(normalizedName);
        return item;
      })
      .filter(Boolean);
  };

  return {
    exportToCSV,
    parseCSVData,
  };
};