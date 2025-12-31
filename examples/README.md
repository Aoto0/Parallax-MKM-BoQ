# Example Building Plans

This directory contains sample building plans you can use to test the BoQ generator.

## Test Files

For testing purposes, you can use:

1. **Sample Floor Plan**: Any architectural floor plan in PDF or image format
2. **Site Plan**: Construction site layouts
3. **Elevation Drawings**: Building elevation views

## Expected Information in Building Plans

The AI will look for:

- **Dimensions**: Length, width, height measurements
- **Areas**: Floor areas, wall areas, roof areas
- **Room Layouts**: Number and types of rooms
- **Materials**: Specified materials (concrete, steel, brick, etc.)
- **Structural Elements**: Beams, columns, slabs
- **Doors & Windows**: Count and dimensions
- **Finishes**: Flooring, plastering, painting specifications
- **Systems**: Electrical, plumbing, HVAC details

## Sample Building Plan Specifications

### Typical Small Residential Building (Example)

**General Information:**
- Building Type: Single-story residential
- Total Built-up Area: 250 m² (2,690 sq ft)
- Foundation: RCC with depth 1.5m
- Structure: Load-bearing brick masonry with RCC roof

**Room Layout:**
- Living Room: 20 m²
- Bedrooms: 3 (12 m² each)
- Kitchen: 10 m²
- Bathrooms: 2 (4 m² each)
- Corridor: 8 m²

**Key Specifications:**
- Foundation: PCC 1:4:8, thickness 150mm
- Plinth: RCC M25, thickness 150mm
- Walls: 230mm brick masonry in cement mortar
- Roof: RCC slab M25, thickness 125mm
- Flooring: Vitrified tiles
- Plastering: 12mm internal, 15mm external
- Doors: 8 nos (wooden with frames)
- Windows: 12 nos (aluminum sliding)
- Painting: Emulsion interior, weather-proof exterior

**Estimated Quantities (Typical):**
- Excavation: ~45 m³
- Concrete: ~47 m³ (PCC + RCC)
- Brickwork: ~85 m³
- Steel: ~2,800 kg
- Plastering: ~660 m²
- Flooring: ~250 m²

## Creating Test Plans

If you want to create your own test plans:

1. Draw a simple floor plan with dimensions
2. Add labels for rooms and materials
3. Include dimension annotations
4. Save as PDF or high-quality image (JPEG/PNG)
5. Upload through the web interface

The AI will extract the information and generate a BoQ accordingly.
