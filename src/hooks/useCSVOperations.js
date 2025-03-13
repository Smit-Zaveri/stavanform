export const useCSVOperations = (collectionName, collections) => {
  const exportToCSV = () => {
    const csvHeaders = [
      "Name",
      "Display Name (Gujarati)",
      "Display Name (Hindi)",
      "Display Name (English)",
      "Order Number",
      "Picture URL"
    ];
    const csvRows = collections.map(
      ({ name, displayName, numbering, picture }) => [
        name,
        // Handle displayName array, ensuring we don't output "undefined"
        Array.isArray(displayName) ? displayName[0] || "" : "",
        Array.isArray(displayName) ? displayName[1] || "" : "",
        Array.isArray(displayName) ? displayName[2] || "" : "",
        numbering,
        picture || "",
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
    const gujaratiIndex = headers.indexOf("Display Name (Gujarati)");
    const hindiIndex = headers.indexOf("Display Name (Hindi)");
    const englishIndex = headers.indexOf("Display Name (English)");
    const numberingIndex = headers.indexOf("Order Number");
    const pictureIndex = headers.indexOf("Picture URL");

    // Support both new and old CSV formats
    const hasMultilingualColumns = gujaratiIndex !== -1 && hindiIndex !== -1 && englishIndex !== -1;
    const oldDisplayNameIndex = headers.indexOf("Display Name");

    if (nameIndex === -1 || (!hasMultilingualColumns && oldDisplayNameIndex === -1) || numberingIndex === -1) {
      throw new Error(
        "CSV must have Name, Display Names (either multilingual or single column), and Order Number columns. Picture URL is optional."
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

        let displayName;
        if (hasMultilingualColumns) {
          displayName = [
            values[gujaratiIndex]?.trim() || "",
            values[hindiIndex]?.trim() || "",
            values[englishIndex]?.trim() || ""
          ];
        } else {
          // Handle old format - put the single display name in the first position
          displayName = [
            values[oldDisplayNameIndex]?.trim() || "",
            "",
            ""
          ];
        }

        const item = {
          name: values[nameIndex]?.trim(),
          displayName,
          numbering: parseFloat(values[numberingIndex]?.trim()),
          picture: pictureIndex !== -1 ? values[pictureIndex]?.trim() : "",
        };

        if (!item.name || !item.displayName.some(name => name.trim()) || isNaN(item.numbering)) return null;

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