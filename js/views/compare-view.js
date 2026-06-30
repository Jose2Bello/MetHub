function compareValues(valA, valB, key) {
    const isDifferent = valA !== valB;
    return `<tr class="${isDifferent ? 'highlight' : ''}">
        <td>${valA}</td><td>${key}</td><td>${valB}</td>
    </tr>`;
}