import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import { SelectDropdown } from "./selectDropdown";
import { dialogStyle, dialogCancelButtonStyle, dialogButtonStyle } from "./styles";
import { CustomTextField } from "./customTextField";
import theme from "assets/theme";
import { BorderColor } from "@mui/icons-material";

const PaginationFooter = ({
  currentPage,
  rowsPerPage,
  totalPages,
  totalRecords,
  onPageChange,
  onRowsPerPageChange,
  loading = false,
  disabled = false,
  showFirstButton = true,
  showLastButton = true,
  color = "primary",
  variant = "outlined",
  customRowsPerPageOptions = null,
  maxCustomValue = 1000,
  minCustomValue = 1,
  position = "absolute",
  backgroundColor,
  borderRadius = 2,
  sx = {},
  ...otherProps
}) => {
  // Custom value dialog state
  const [customValueDialog, setCustomValueDialog] = useState(false);
  const [customValue, setCustomValue] = useState("");

  // Default rows per page options
  const defaultRowsPerPageOptions = useMemo(
    () => [
      { label: "5", value: 5 },
      { label: "10", value: 10 },
      { label: "25", value: 25 },
      { label: "50", value: 50 },
      { label: "100", value: 100 },
      { label: "Custom", value: "custom" },
    ],
    []
  );

  // Use provided options or default ones
  const rowsPerPageOptions = customRowsPerPageOptions || defaultRowsPerPageOptions;

  // Handle page change
  const handlePageChange = useCallback(
    (event, newPage) => {
      if (onPageChange) {
        onPageChange(event, newPage);
      }
    },
    [onPageChange]
  );

  // Handle rows per page change
  const handleRowsPerPageChange = useCallback(
    (event) => {
      const selectedValue = event.target.value;

      if (selectedValue === "Custom" || selectedValue === "custom") {
        setCustomValueDialog(true);
      } else {
        const numericValue = parseInt(selectedValue, 10);
        if (onRowsPerPageChange) {
          onRowsPerPageChange({
            target: { value: numericValue },
            numericValue,
            resetToFirstPage: true,
          });
        }
      }
    },
    [onRowsPerPageChange]
  );

  // Handle custom value submission
  const handleCustomValueSubmit = useCallback(() => {
    const numericValue = parseInt(customValue, 10);

    if (!isNaN(numericValue) && numericValue >= minCustomValue && numericValue <= maxCustomValue) {
      if (onRowsPerPageChange) {
        onRowsPerPageChange({
          target: { value: numericValue },
          numericValue,
          resetToFirstPage: true,
          isCustomValue: true,
        });
      }
      setCustomValueDialog(false);
      setCustomValue("");
      toast.success(`Rows per page set to ${numericValue}`);
    } else {
      toast.error(`Please enter a valid number between ${minCustomValue} and ${maxCustomValue}`);
    }
  }, [customValue, minCustomValue, maxCustomValue, onRowsPerPageChange]);

  // Handle custom value dialog close
  const handleCustomValueCancel = useCallback(() => {
    setCustomValueDialog(false);
    setCustomValue("");
  }, []);

  // Get current rows per page display value
  const currentRowsPerPageDisplay = useMemo(() => {
    const standardOption = rowsPerPageOptions.find((option) => option.value === rowsPerPage);
    return standardOption ? standardOption.label : rowsPerPage.toString();
  }, [rowsPerPage, rowsPerPageOptions]);

  // Calculate display range
  const startRecord = Math.min((currentPage - 1) * rowsPerPage + 1, totalRecords);
  const endRecord = Math.min(currentPage * rowsPerPage, totalRecords);

  // Custom Value Dialog Component
  const CustomValueDialog = useMemo(
    () => (
      <Dialog
        open={customValueDialog}
        onClose={handleCustomValueCancel}
        maxWidth="xs"
        fullWidth
        sx={dialogStyle}
      >
        <DialogTitle
          sx={{ color: (theme) => theme.palette.custom.two, fontSize: "0.9rem !important" }}
        >
          Enter Custom Rows Per Page
        </DialogTitle>
        <DialogContent>
          <CustomTextField
            name="customRowsPerPage"
            type="number"
            placeholder={`Number of rows (${minCustomValue}-${maxCustomValue})`}
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCustomValueCancel} size="small" sx={dialogCancelButtonStyle}>
            Cancel
          </Button>
          <Button
            onClick={handleCustomValueSubmit}
            sx={dialogButtonStyle}
            size="small"
            disabled={!customValue || isNaN(parseInt(customValue, 10))}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    ),
    [
      customValueDialog,
      customValue,
      handleCustomValueCancel,
      handleCustomValueSubmit,
      minCustomValue,
      maxCustomValue,
    ]
  );

  const paginationStyles = {
    "& .MuiPaginationItem-root": {
      color: (theme) => theme.palette.custom.text2,
      borderColor: (theme) => theme.palette.custom.pagination,
      fontSize: "0.8rem",
      "&.Mui-selected": {
        backgroundColor: (theme) => theme.palette.custom.highlight,
        borderColor: (theme) => theme.palette.custom.pagination,
        color: (theme) => theme.palette.custom.dark,
        "&:hover": {
          backgroundColor: (theme) => theme.palette.custom.highlight,
        },
      },
    },
  };

  return (
    <>
      <Box
        sx={{
          position: position,
          bottom: 2,
          left: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 1,
          width: "100%",
          ...sx,
        }}
        {...otherProps}
      >
        <Box
          sx={{
            backgroundColor: backgroundColor || ((theme) => theme.palette.custom.background1),
            borderRadius: borderRadius,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 0.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ minWidth: 60 }}>
              <SelectDropdown
                label="rowsPerPage"
                placeholder="Rows per page"
                options={rowsPerPageOptions}
                value={currentRowsPerPageDisplay}
                onChange={handleRowsPerPageChange}
                disabled={disabled || loading}
              />
            </Box>
            <Typography variant="caption" sx={{ color: (theme) => theme.palette.custom.text2 }}>
              {totalRecords > 0
                ? `Showing ${startRecord} to ${endRecord} of ${totalRecords} entries`
                : "No entries to show"}
            </Typography>
          </Box>

          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color={color}
            variant={variant}
            showFirstButton={showFirstButton}
            showLastButton={showLastButton}
            disabled={loading || disabled}
            sx={paginationStyles}
          />
        </Box>
      </Box>
      {CustomValueDialog}
    </>
  );
};

PaginationFooter.propTypes = {
  // Required props
  currentPage: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalRecords: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired,

  // Optional props
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  showFirstButton: PropTypes.bool,
  showLastButton: PropTypes.bool,
  color: PropTypes.oneOf(["primary", "secondary", "standard"]),
  variant: PropTypes.oneOf(["text", "outlined"]),
  customRowsPerPageOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    })
  ),
  maxCustomValue: PropTypes.number,
  minCustomValue: PropTypes.number,
  position: PropTypes.oneOf(["absolute", "relative", "fixed", "static", "sticky"]),
  backgroundColor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  borderRadius: PropTypes.number,
  sx: PropTypes.object,
};

export default PaginationFooter;
